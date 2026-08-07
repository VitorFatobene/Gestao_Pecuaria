import { isAxiosError } from 'axios'
import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerAccountService } from '../services/authService'
import { type RegisterAccountData } from '../types'

const ESTADOS_BRASIL = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
]

const initialFormData: RegisterAccountData = {
  nome: '',
  sobrenome: '',
  telefone: '',
  cidade: '',
  estado: '',
  email: '',
  senha: '',
  nomePropriedadeRural: '',
}

export function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateField(field: keyof RegisterAccountData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await registerAccountService(formData)
      navigate('/login', {
        replace: true,
        state: { message: 'Conta criada com sucesso. Entre para continuar.' },
      })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const responseData = error.response.data as { message?: string }
        setErrorMessage(responseData.message ?? 'Confira os dados informados.')
      } else {
        setErrorMessage('Nao foi possivel criar a conta. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-panel register-panel">
      <h1>Cadastre-se</h1>
      <form className="login-form register-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="nome">Nome</label>
            <input
              autoComplete="given-name"
              id="nome"
              name="nome"
              onChange={(event) => updateField('nome', event.target.value)}
              required
              type="text"
              value={formData.nome}
            />
          </div>

          <div className="form-field">
            <label htmlFor="sobrenome">Sobrenome</label>
            <input
              autoComplete="family-name"
              id="sobrenome"
              name="sobrenome"
              onChange={(event) => updateField('sobrenome', event.target.value)}
              required
              type="text"
              value={formData.sobrenome}
            />
          </div>

          <div className="form-field">
            <label htmlFor="telefone">Telefone</label>
            <input
              autoComplete="tel"
              id="telefone"
              name="telefone"
              onChange={(event) => updateField('telefone', event.target.value)}
              required
              type="tel"
              value={formData.telefone}
            />
          </div>

          <div className="form-field">
            <label htmlFor="cidade">Cidade</label>
            <input
              autoComplete="address-level2"
              id="cidade"
              name="cidade"
              onChange={(event) => updateField('cidade', event.target.value)}
              required
              type="text"
              value={formData.cidade}
            />
          </div>

          <div className="form-field">
            <label htmlFor="estado">Estado</label>
            <select
              autoComplete="address-level1"
              id="estado"
              name="estado"
              onChange={(event) => updateField('estado', event.target.value)}
              required
              value={formData.estado}
            >
              <option value="">Selecione</option>
              {ESTADOS_BRASIL.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="email-cadastro">E-mail</label>
            <input
              autoComplete="email"
              id="email-cadastro"
              name="email"
              onChange={(event) => updateField('email', event.target.value)}
              required
              type="email"
              value={formData.email}
            />
          </div>

          <div className="form-field">
            <label htmlFor="senha-cadastro">Senha</label>
            <input
              autoComplete="new-password"
              id="senha-cadastro"
              minLength={6}
              name="senha"
              onChange={(event) => updateField('senha', event.target.value)}
              required
              type="password"
              value={formData.senha}
            />
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="nomePropriedadeRural">Nome da propriedade rural</label>
            <input
              id="nomePropriedadeRural"
              name="nomePropriedadeRural"
              onChange={(event) => updateField('nomePropriedadeRural', event.target.value)}
              required
              type="text"
              value={formData.nomePropriedadeRural}
            />
          </div>
        </div>

        {errorMessage && <p className="form-error">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Criando...' : 'Criar conta'}
        </button>
      </form>
      <div className="auth-footer">
        <span>Ja tem conta?</span>
        <Link to="/login">Entrar</Link>
      </div>
    </section>
  )
}

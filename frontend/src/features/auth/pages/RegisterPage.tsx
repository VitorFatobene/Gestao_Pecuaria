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

const REQUIRED_FIELD_MESSAGE = 'campo obrigatório'

const REQUIRED_FIELDS: Array<keyof RegisterAccountData> = [
  'nome',
  'sobrenome',
  'telefone',
  'cidade',
  'estado',
  'email',
  'senha',
  'nomePropriedadeRural',
]

export function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(initialFormData)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterAccountData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function updateField(field: keyof RegisterAccountData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))

    if (value.trim()) {
      setFieldErrors((currentFieldErrors) => ({
        ...currentFieldErrors,
        [field]: undefined,
      }))
    }
  }

  function validateRequiredFields(data: RegisterAccountData) {
    return REQUIRED_FIELDS.reduce<Partial<Record<keyof RegisterAccountData, string>>>(
      (errors, field) => {
        if (!data[field].trim()) {
          errors[field] = REQUIRED_FIELD_MESSAGE
        }

        return errors
      },
      {},
    )
  }

  function handleFieldBlur(field: keyof RegisterAccountData) {
    setFieldErrors((currentFieldErrors) => ({
      ...currentFieldErrors,
      [field]: formData[field].trim() ? undefined : REQUIRED_FIELD_MESSAGE,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const validationErrors = validateRequiredFields(formData)
    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

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
      <form className="login-form register-form" noValidate onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="nome">
              Nome <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.nome ? 'nome-error' : undefined}
              aria-invalid={fieldErrors.nome ? 'true' : undefined}
              autoComplete="given-name"
              id="nome"
              name="nome"
              onBlur={() => handleFieldBlur('nome')}
              onChange={(event) => updateField('nome', event.target.value)}
              placeholder="Informe seu nome"
              required
              type="text"
              value={formData.nome}
            />
            {fieldErrors.nome && (
              <p className="field-error" id="nome-error">
                {fieldErrors.nome}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="sobrenome">
              Sobrenome <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.sobrenome ? 'sobrenome-error' : undefined}
              aria-invalid={fieldErrors.sobrenome ? 'true' : undefined}
              autoComplete="family-name"
              id="sobrenome"
              name="sobrenome"
              onBlur={() => handleFieldBlur('sobrenome')}
              onChange={(event) => updateField('sobrenome', event.target.value)}
              placeholder="Informe seu sobrenome"
              required
              type="text"
              value={formData.sobrenome}
            />
            {fieldErrors.sobrenome && (
              <p className="field-error" id="sobrenome-error">
                {fieldErrors.sobrenome}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="telefone">
              Telefone <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.telefone ? 'telefone-error' : undefined}
              aria-invalid={fieldErrors.telefone ? 'true' : undefined}
              autoComplete="tel"
              id="telefone"
              name="telefone"
              onBlur={() => handleFieldBlur('telefone')}
              onChange={(event) => updateField('telefone', event.target.value)}
              placeholder="(00) 00000-0000"
              required
              type="tel"
              value={formData.telefone}
            />
            {fieldErrors.telefone && (
              <p className="field-error" id="telefone-error">
                {fieldErrors.telefone}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="cidade">
              Cidade <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.cidade ? 'cidade-error' : undefined}
              aria-invalid={fieldErrors.cidade ? 'true' : undefined}
              autoComplete="address-level2"
              id="cidade"
              name="cidade"
              onBlur={() => handleFieldBlur('cidade')}
              onChange={(event) => updateField('cidade', event.target.value)}
              placeholder="Informe sua cidade"
              required
              type="text"
              value={formData.cidade}
            />
            {fieldErrors.cidade && (
              <p className="field-error" id="cidade-error">
                {fieldErrors.cidade}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="estado">
              Estado <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <select
              aria-describedby={fieldErrors.estado ? 'estado-error' : undefined}
              aria-invalid={fieldErrors.estado ? 'true' : undefined}
              autoComplete="address-level1"
              id="estado"
              name="estado"
              onBlur={() => handleFieldBlur('estado')}
              onChange={(event) => updateField('estado', event.target.value)}
              required
              value={formData.estado}
            >
              <option value="">Selecione o estado</option>
              {ESTADOS_BRASIL.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {fieldErrors.estado && (
              <p className="field-error" id="estado-error">
                {fieldErrors.estado}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="email-cadastro">
              E-mail <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.email ? 'email-cadastro-error' : undefined}
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              autoComplete="email"
              id="email-cadastro"
              name="email"
              onBlur={() => handleFieldBlur('email')}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="seuemail@exemplo.com"
              required
              type="email"
              value={formData.email}
            />
            {fieldErrors.email && (
              <p className="field-error" id="email-cadastro-error">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="senha-cadastro">
              Senha <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={fieldErrors.senha ? 'senha-cadastro-error' : undefined}
              aria-invalid={fieldErrors.senha ? 'true' : undefined}
              autoComplete="new-password"
              id="senha-cadastro"
              minLength={6}
              name="senha"
              onBlur={() => handleFieldBlur('senha')}
              onChange={(event) => updateField('senha', event.target.value)}
              placeholder="Crie uma senha"
              required
              type="password"
              value={formData.senha}
            />
            {fieldErrors.senha && (
              <p className="field-error" id="senha-cadastro-error">
                {fieldErrors.senha}
              </p>
            )}
          </div>

          <div className="form-field form-field-wide">
            <label htmlFor="nomePropriedadeRural">
              Nome da propriedade rural <span className="required-marker" aria-hidden="true">*</span>
            </label>
            <input
              aria-describedby={
                fieldErrors.nomePropriedadeRural ? 'nomePropriedadeRural-error' : undefined
              }
              aria-invalid={fieldErrors.nomePropriedadeRural ? 'true' : undefined}
              id="nomePropriedadeRural"
              name="nomePropriedadeRural"
              onBlur={() => handleFieldBlur('nomePropriedadeRural')}
              onChange={(event) => updateField('nomePropriedadeRural', event.target.value)}
              placeholder="Informe o nome da propriedade"
              required
              type="text"
              value={formData.nomePropriedadeRural}
            />
            {fieldErrors.nomePropriedadeRural && (
              <p className="field-error" id="nomePropriedadeRural-error">
                {fieldErrors.nomePropriedadeRural}
              </p>
            )}
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

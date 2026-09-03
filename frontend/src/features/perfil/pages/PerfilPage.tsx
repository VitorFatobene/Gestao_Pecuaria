import { isAxiosError } from 'axios'
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Save, Tractor, UserRound } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { atualizarMeuPerfil, buscarMeuPerfil, type AtualizarMeuPerfilData } from '../services/perfilService'

type PerfilFormData = AtualizarMeuPerfilData & {
  email: string
}

const initialFormData: PerfilFormData = {
  nome: '',
  email: '',
  nomeFazenda: '',
  senhaAtual: '',
  novaSenha: '',
  confirmacaoNovaSenha: '',
}

const PASSWORD_MIN_LENGTH = 6

export function PerfilPage() {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [formData, setFormData] = useState<PerfilFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PerfilFormData, string>>>({})

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        setErrorMessage(null)
        const perfil = await buscarMeuPerfil()

        if (isMounted) {
          setFormData({
            nome: perfil.nome,
            email: perfil.email,
            nomeFazenda: perfil.nomeFazenda,
            senhaAtual: '',
            novaSenha: '',
            confirmacaoNovaSenha: '',
          })
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Não foi possível carregar o perfil.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function updateField(field: keyof PerfilFormData, value: string) {
    setFormData((currentFormData) => ({
      ...currentFormData,
      [field]: value,
    }))
    setSuccessMessage(null)

    if (fieldErrors[field]) {
      setFieldErrors((currentFieldErrors) => ({
        ...currentFieldErrors,
        [field]: validateField(field, value),
      }))
    }
  }

  function validateField(field: keyof PerfilFormData, value: string) {
    if ((field === 'nome' || field === 'nomeFazenda') && !value.trim()) {
      return 'campo obrigatório'
    }

    if (field === 'novaSenha' && value && value.length < PASSWORD_MIN_LENGTH) {
      return 'A nova senha deve ter no mínimo 6 caracteres.'
    }

    return undefined
  }

  function validateForm(data: PerfilFormData) {
    const errors: Partial<Record<keyof PerfilFormData, string>> = {}

    const nomeError = validateField('nome', data.nome)
    const nomeFazendaError = validateField('nomeFazenda', data.nomeFazenda)
    const novaSenhaError = validateField('novaSenha', data.novaSenha ?? '')

    if (nomeError) {
      errors.nome = nomeError
    }

    if (nomeFazendaError) {
      errors.nomeFazenda = nomeFazendaError
    }

    if (novaSenhaError) {
      errors.novaSenha = novaSenhaError
    }

    if (data.novaSenha?.trim()) {
      if (!data.senhaAtual?.trim()) {
        errors.senhaAtual = 'Informe a senha atual.'
      }

      if (!data.confirmacaoNovaSenha?.trim()) {
        errors.confirmacaoNovaSenha = 'Confirme a nova senha.'
      } else if (data.novaSenha !== data.confirmacaoNovaSenha) {
        errors.confirmacaoNovaSenha = 'As novas senhas não coincidem.'
      }
    }

    return errors
  }

  function handleFieldBlur(field: keyof PerfilFormData) {
    setFieldErrors((currentFieldErrors) => ({
      ...currentFieldErrors,
      [field]: validateField(field, formData[field] ?? ''),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    const validationErrors = validateForm(formData)
    setFieldErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const perfilAtualizado = await atualizarMeuPerfil({
        nome: formData.nome.trim(),
        nomeFazenda: formData.nomeFazenda.trim(),
        senhaAtual: formData.senhaAtual?.trim() || undefined,
        novaSenha: formData.novaSenha || undefined,
        confirmacaoNovaSenha: formData.confirmacaoNovaSenha || undefined,
      })

      updateUser({
        id: perfilAtualizado.id,
        nome: perfilAtualizado.nome,
        email: perfilAtualizado.email,
        nomeFazenda: perfilAtualizado.nomeFazenda,
        role: perfilAtualizado.role,
      })

      setFormData((currentFormData) => ({
        ...currentFormData,
        nome: perfilAtualizado.nome,
        email: perfilAtualizado.email,
        nomeFazenda: perfilAtualizado.nomeFazenda,
        senhaAtual: '',
        novaSenha: '',
        confirmacaoNovaSenha: '',
      }))
      setFieldErrors({})
      setSuccessMessage('Perfil atualizado com sucesso.')
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 400) {
        const responseData = error.response.data as { message?: string }
        setErrorMessage(responseData.message ?? 'Não foi possível atualizar o perfil.')
      } else {
        setErrorMessage('Não foi possível atualizar o perfil.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="perfil-page">
        <section className="perfil-loading" aria-live="polite">
          <Loader2 size={22} aria-hidden="true" />
          <span>Carregando perfil...</span>
        </section>
      </div>
    )
  }

  return (
    <div className="perfil-page">
      <section className="perfil-page-header">
        <div>
          <h1>Meu perfil</h1>
          <p>Gerencie seus dados pessoais e as informações da propriedade.</p>
        </div>
        <button type="button" className="secondary-action perfil-back-action" onClick={() => navigate(-1)}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar
        </button>
      </section>

      <form className="perfil-card" noValidate onSubmit={handleSubmit}>
        {successMessage && (
          <div className="perfil-feedback is-success" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="perfil-feedback is-error" role="alert">
            <span>{errorMessage}</span>
          </div>
        )}

        <section className="perfil-section">
          <div className="perfil-section-heading">
            <UserRound size={19} aria-hidden="true" />
            <h2>Informações pessoais</h2>
          </div>

          <div className="perfil-form-grid">
            <div className="perfil-form-field">
              <label htmlFor="perfil-nome">Nome</label>
              <input
                aria-describedby={fieldErrors.nome ? 'perfil-nome-error' : undefined}
                aria-invalid={fieldErrors.nome ? 'true' : undefined}
                autoComplete="given-name"
                id="perfil-nome"
                name="nome"
                onBlur={() => handleFieldBlur('nome')}
                onChange={(event) => updateField('nome', event.target.value)}
                placeholder="Vitor"
                type="text"
                value={formData.nome}
              />
              {fieldErrors.nome && (
                <p className="field-error" id="perfil-nome-error">
                  {fieldErrors.nome}
                </p>
              )}
            </div>

            <div className="perfil-form-field">
              <label htmlFor="perfil-email">E-mail</label>
              <input
                aria-readonly="true"
                autoComplete="email"
                id="perfil-email"
                name="email"
                readOnly
                type="email"
                value={formData.email}
              />
            </div>
          </div>
        </section>

        <section className="perfil-section">
          <div className="perfil-section-heading">
            <Tractor size={19} aria-hidden="true" />
            <h2>Propriedade</h2>
          </div>

          <div className="perfil-form-field">
            <label htmlFor="perfil-fazenda">Nome da fazenda</label>
            <input
              aria-describedby={fieldErrors.nomeFazenda ? 'perfil-fazenda-error' : undefined}
              aria-invalid={fieldErrors.nomeFazenda ? 'true' : undefined}
              autoComplete="organization"
              id="perfil-fazenda"
              name="nomeFazenda"
              onBlur={() => handleFieldBlur('nomeFazenda')}
              onChange={(event) => updateField('nomeFazenda', event.target.value)}
              placeholder="Estância Dona Rose"
              type="text"
              value={formData.nomeFazenda}
            />
            {fieldErrors.nomeFazenda && (
              <p className="field-error" id="perfil-fazenda-error">
                {fieldErrors.nomeFazenda}
              </p>
            )}
          </div>
        </section>

        <section className="perfil-section">
          <div className="perfil-section-heading">
            <KeyRound size={19} aria-hidden="true" />
            <h2>Segurança</h2>
          </div>

          <div className="perfil-form-grid">
            <div className="perfil-form-field">
              <label htmlFor="perfil-senha-atual">Senha atual</label>
              <input
                aria-describedby={fieldErrors.senhaAtual ? 'perfil-senha-atual-error' : undefined}
                aria-invalid={fieldErrors.senhaAtual ? 'true' : undefined}
                autoComplete="current-password"
                id="perfil-senha-atual"
                name="senhaAtual"
                onChange={(event) => updateField('senhaAtual', event.target.value)}
                type="password"
                value={formData.senhaAtual}
              />
              {fieldErrors.senhaAtual && (
                <p className="field-error" id="perfil-senha-atual-error">
                  {fieldErrors.senhaAtual}
                </p>
              )}
            </div>

            <div className="perfil-form-field">
              <label htmlFor="perfil-nova-senha">Nova senha</label>
              <input
                aria-describedby={fieldErrors.novaSenha ? 'perfil-nova-senha-error' : undefined}
                aria-invalid={fieldErrors.novaSenha ? 'true' : undefined}
                autoComplete="new-password"
                id="perfil-nova-senha"
                name="novaSenha"
                onBlur={() => handleFieldBlur('novaSenha')}
                onChange={(event) => updateField('novaSenha', event.target.value)}
                type="password"
                value={formData.novaSenha}
              />
              {fieldErrors.novaSenha && (
                <p className="field-error" id="perfil-nova-senha-error">
                  {fieldErrors.novaSenha}
                </p>
              )}
            </div>

            <div className="perfil-form-field perfil-form-wide">
              <label htmlFor="perfil-confirmar-senha">Confirmar nova senha</label>
              <input
                aria-describedby={fieldErrors.confirmacaoNovaSenha ? 'perfil-confirmar-senha-error' : undefined}
                aria-invalid={fieldErrors.confirmacaoNovaSenha ? 'true' : undefined}
                autoComplete="new-password"
                id="perfil-confirmar-senha"
                name="confirmacaoNovaSenha"
                onChange={(event) => updateField('confirmacaoNovaSenha', event.target.value)}
                type="password"
                value={formData.confirmacaoNovaSenha}
              />
              {fieldErrors.confirmacaoNovaSenha && (
                <p className="field-error" id="perfil-confirmar-senha-error">
                  {fieldErrors.confirmacaoNovaSenha}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="perfil-form-actions">
          <button type="button" className="secondary-action" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="primary-action" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="button-spinner" size={17} aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
            Salvar alterações
          </button>
        </div>
      </form>
    </div>
  )
}

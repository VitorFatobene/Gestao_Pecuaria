import { type FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAxiosError } from 'axios'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const successMessage =
    typeof location.state === 'object' &&
    location.state !== null &&
    'message' in location.state &&
    typeof location.state.message === 'string'
      ? location.state.message
      : null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await login({ email, senha })
      navigate('/', { replace: true })
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setErrorMessage('E-mail ou senha invalidos.')
      } else {
        setErrorMessage('Nao foi possivel realizar o login. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="login-panel">
      <h1>Login</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email">E-mail</label>
        <input
          autoComplete="email"
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />

        <label htmlFor="senha">Senha</label>
        <input
          autoComplete="current-password"
          id="senha"
          name="senha"
          onChange={(event) => setSenha(event.target.value)}
          required
          type="password"
          value={senha}
        />

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-success">{successMessage}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <div className="auth-footer">
        <span>Ainda nao tem conta?</span>
        <Link to="/cadastro">Crie sua conta</Link>
      </div>
    </section>
  )
}

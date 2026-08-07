import { ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { NotificationPopup } from '../../../components/NotificationPopup'
import { AnimalForm } from '../components/AnimalForm'
import {
  atualizarAnimal,
  buscarAnimalPorId,
  criarAnimal,
} from '../services/animalService'
import { type Animal, type AnimalRequest } from '../types/animal.types'

export function CadastroAnimal() {
  const { id } = useParams()
  const navigate = useNavigate()
  const animalId = id ? Number(id) : null
  const isEditing = Boolean(animalId)

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(animalId))
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    async function loadAnimal() {
      if (!animalId) {
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await buscarAnimalPorId(animalId)
        setAnimal(data)
      } catch {
        setError('Nao foi possivel carregar os dados do animal.')
      } finally {
        setIsLoading(false)
      }
    }

    loadAnimal()
  }, [animalId])

  async function handleSubmit(data: AnimalRequest) {
    try {
      setIsSaving(true)
      setError(null)

      if (animalId) {
        await atualizarAnimal(animalId, data)
        setFeedback('Animal atualizado com sucesso.')
      } else {
        await criarAnimal(data)
        setFeedback('Animal cadastrado com sucesso.')
      }

      window.setTimeout(() => navigate('/animais'), 1200)
    } catch {
      setError('Nao foi possivel salvar o animal. Revise os dados e tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animal-editor-page">
      <section className="animais-page-header">
        <div>
          <span>{isEditing ? 'Editar cadastro' : 'Novo cadastro'}</span>
          <h1>{isEditing ? 'Editar Animal' : 'Cadastrar Animal'}</h1>
          <p>{isEditing ? 'Atualize os dados cadastrais e financeiros.' : 'Registre a compra e o pasto inicial.'}</p>
        </div>
        <button type="button" className="secondary-action" onClick={() => navigate('/animais')}>
          <ArrowLeft size={17} aria-hidden="true" />
          Voltar
        </button>
      </section>

      {feedback && <NotificationPopup message={feedback} onClose={() => setFeedback(null)} />}
      {error && (
        <div className="animais-error" role="alert">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="animais-loading">Carregando animal...</div>
      ) : (
        <AnimalForm animal={animal} isSaving={isSaving} onSubmit={handleSubmit} onCancel={() => navigate('/animais')} />
      )}
    </div>
  )
}

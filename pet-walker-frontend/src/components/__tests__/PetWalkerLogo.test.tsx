import { render, screen } from '@testing-library/react'
import PetWalkerLogo from '../shared/PetWalkerLogo'

describe('PetWalkerLogo', () => {
  it('debería renderizar correctamente', () => {
    render(<PetWalkerLogo />)
    
    const logo = screen.getByRole('img', { name: /pet walker logo/i })
    expect(logo).toBeInTheDocument()
  })

  it('debería aplicar el tamaño personalizado', () => {
    render(<PetWalkerLogo size={64} />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveStyle({ width: '64px', height: '64px' })
  })

  it('debería aplicar clases CSS personalizadas', () => {
    const customClass = 'custom-logo-class'
    render(<PetWalkerLogo className={customClass} />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveClass(customClass)
  })

  it('debería usar el tamaño por defecto cuando no se especifica', () => {
    render(<PetWalkerLogo />)
    
    const logo = screen.getByRole('img')
    expect(logo).toHaveStyle({ width: '32px', height: '32px' })
  })
}) 
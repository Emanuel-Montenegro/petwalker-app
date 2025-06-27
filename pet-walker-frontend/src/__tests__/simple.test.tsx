describe('Frontend Testing Setup', () => {
  it('debería ejecutar tests correctamente', () => {
    expect(true).toBe(true)
  })

  it('debería manejar matemáticas básicas', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
  })

  it('debería manejar objetos de React', () => {
    const props = {
      className: 'test-class',
      size: 32,
      children: 'Test content'
    }

    expect(props.className).toBe('test-class')
    expect(props.size).toBe(32)
    expect(props).toHaveProperty('children')
  })

  it('debería manejar arrays de roles', () => {
    const roles = ['DUENO', 'PASEADOR', 'ADMIN']
    
    expect(roles).toHaveLength(3)
    expect(roles).toContain('DUENO')
    expect(roles[0]).toBe('DUENO')
  })

  it('debería manejar tipos de Pet Walker', () => {
    const mascota = {
      id: 1,
      nombre: 'Rex',
      especie: 'Perro',
      raza: 'Labrador',
      edad: 3,
      sociable: true
    }

    expect(mascota.nombre).toBe('Rex')
    expect(mascota.sociable).toBe(true)
    expect(mascota).toEqual(expect.objectContaining({
      especie: 'Perro'
    }))
  })
}) 
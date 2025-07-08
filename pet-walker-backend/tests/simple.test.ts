describe('Testing Setup', () => {
  it('debería ejecutar tests correctamente', () => {
    expect(true).toBe(true);
  });

  it('debería manejar matemáticas básicas', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
  });

  it('debería manejar strings', () => {
    const mensaje = 'Pet Walker Testing';
    expect(mensaje).toContain('Pet Walker');
    expect(mensaje.length).toBeGreaterThan(0);
  });

  it('debería manejar arrays', () => {
    const roles = ['DUENO', 'PASEADOR', 'ADMIN'];
    expect(roles).toHaveLength(3);
    expect(roles).toContain('DUENO');
    expect(roles[0]).toBe('DUENO');
  });

  it('debería manejar objetos', () => {
    const usuario = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      rol: 'DUENO'
    };

    expect(usuario.id).toBe(1);
    expect(usuario.nombre).toBe('Test User');
    expect(usuario).toHaveProperty('email');
    expect(usuario).toEqual(expect.objectContaining({
      rol: 'DUENO'
    }));
  });

  it('debería manejar promesas', async () => {
    const promesa = Promise.resolve('Testing async');
    await expect(promesa).resolves.toBe('Testing async');
  });

  it('debería manejar errores', () => {
    const funcionConError = () => {
      throw new Error('Test error');
    };

    expect(funcionConError).toThrow('Test error');
  });
}); 
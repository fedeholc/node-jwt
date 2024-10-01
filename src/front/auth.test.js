import { describe, it, expect, vi, afterEach } from "vitest";
import { getNewAccessToken } from "./auth.js";

describe("getNewAccessToken", () => {
  // Caso 1: Solicitud exitosa y el token de acceso está presente en la respuesta
  it("debería devolver el token de acceso cuando la respuesta es exitosa y contiene accessToken", async () => {
    const mockAccessToken = "mockToken123";

    // Mock de fetch para retornar una respuesta exitosa
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ accessToken: mockAccessToken }),
      })
    );

    const result = await getNewAccessToken();
    expect(result).toBe(mockAccessToken); // Verificar que el token de acceso es el esperado
  });

  // Caso 2: Solicitud exitosa pero sin token de acceso
  it("debería devolver null cuando la respuesta no contiene accessToken", async () => {
    // Mock de fetch para retornar una respuesta exitosa sin token
    // @ts-ignore

    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
    );

    const result = await getNewAccessToken();
    expect(result).toBeNull(); // Verificar que el resultado es null
  });

  // Caso 3: Error en la solicitud (catch del bloque try)
  it("debería devolver null cuando fetch lanza un error", async () => {
    // Mock de fetch para simular un error
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Fetch failed")));

    const result = await getNewAccessToken();
    expect(result).toBeNull(); // Verificar que el resultado es null
  });

  // Caso 4: Solicitud exitosa pero el formato de la respuesta es incorrecto
  it("debería devolver null cuando la respuesta no es válida", async () => {
    // Mock de fetch para devolver una respuesta con un formato incorrecto
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.reject(new Error("Invalid JSON")),
      })
    );

    const result = await getNewAccessToken();
    expect(result).toBeNull(); // Verificar que el resultado es null
  });

  // Caso 5: Verifica que fetch se haga con credentials: 'include'
  it("debería hacer fetch con 'credentials: include'", async () => {
    const mockAccessToken = "mockToken123";

    // Mock de fetch para retornar una respuesta exitosa
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ accessToken: mockAccessToken }),
      })
    );

    await getNewAccessToken();

    // Verifica que fetch haya sido llamado con credentials: 'include'
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        credentials: "include", // Verificamos que 'credentials' esté configurado como 'include'
      })
    );
  });

  // Limpiar mocks después de cada test
  afterEach(() => {
    vi.clearAllMocks(); // Limpiar todos los mocks de fetch después de cada test
  });
});

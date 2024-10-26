sudo kill $(sudo lsof -t -i:3000)

docs de jose <https://github.com/panva/jose/tree/1f8304f72760c3be8f5989b43029d0060f6e96af/docs>

## a futuro

- [ ] uuid como identificador en BD? (creo que no, mejor index email)
- [ ] implementar cerrar sesion de dispositivos (implica registro o versionado de tokens).
- [ ] implementar email magic links, e email verification (sirve para evitar que te espameen el sitio)
- [ ] PWA y service workers (validación token, actualización info al conectar, etc.), guardar config en local storage, etc.
- [ ] validación de mails y passwords en los inputs, con colores, etc.
- [ ] cambiar alerts por textos en la misma web
- [ ] Poner todos los textos en ingles
- [ ] Hacer todos los tests
- [ ] poner colores (y algo más) en variables css
- [ ] validar passwords y sus tamaños
- [ ] implementar cambiar contraseña? (ahora solo se puede con reset)
- [ ] leer web.dev sobre cookiesauth
- [ ] cuando escriba la explicacion del codigo, dar cuenta de los tradeoffs, explicar por qué cada eleccion. Ej: access token con o sin refresh, cuando renovar, etc.

## sobre lo hecho

- denylist de tokens: está implementado cuando el usuario hace logout, tambien cuando borra la cuenta. Al renovar el refresh no tiene sentido porque la renovacion se hace cuando se vence, no antes (sino habrìa que sumarlo a la lista en ese momento). Al reset de password tampoco hace falta porque el reset se hace estanddo deslogueado (salvo que haga reset desde otra pc, u otro navegador, pero en ese caso creo que no tendria sentido invalidar la de las otras pcs o sesiones -igual si se quisiera hacer habrìa que implementar registro de tokens por usuario). Tampoco implemente ahora el tema de posibles tokens comprometidos y su posible detección (ej. cambios de IP o agentes).
- no uso cookies firmadas (se hace pasandole una clave a cookie parser), porque no tienen sentido con JWT que ya están firmados, y la de session también está firmada por express-session.

## Aprendizajes / Ideas

### estrategias y tradeoffs

- los principales tradeoffs son entre experiencia de usuario (ej. si se tiene que loguear muy seguido o no), seguridad, y performance (ej. si se tiene que consultar la base de datos en cada request o no).
- access token con o sin refresh
- cuando renovar el access token, si antes de que expire o cuando ya expiró
- si guardar el refresh token en una cookie o en el local storage
- si hacer el refresh token con un tiempo de vida largo o corto, cuando renovarlo
- en teoría el access token junto con el refresh token, evitan el tener que consultar la base de datos para cada request, solo se consulta la base de datos cuando se renueva el access token? (o cuando se renueva el refresh token?)
- el refresh token también permite las blacklists de tokens (ver).
- el jwt se puede decodificar en el cliente (no su firma), por ejemplo para ver su fecha de expiración, etc. Por eso no se debe guardar información sensible en el jwt.

### Auth y offline

- En principio ahora no tiene sentido una funcionalidad de auth offline porque si no hay conexión a internet no va a poder acceder a la web. Tendria sentido en una webapp que se puede usar offline, como fotoYOP o foto-v, pero para eso primer tendría que desarrollar la parte de pwa y service workers para vanilla js.

### Cookies

- Las cookies se pueden usar httpOnly para que no se puedan acceder desde el cliente, y secure para que solo se puedan usar en conexiones seguras (https).
- Las cookies pueden firmarse con un secret para que no se puedan modificar desde el cliente (en realidad se pueden modificar pero luego desde el lado del servidor no se va a poder verificar la firma).

### Express

#### Routers y handlers

- Se puede trabajar con app pasándole el handler al método como por ejemplo `app.get("/login", handlerLogin")` o se puede trabajar con el router, que es un middleware que se puede montar en la app con `app.use("/login", routerLogin)`. Luego el router si va a tener el app.get/post/etc y los correspondientes handlers.
- El router sirve por ejemplo para cuando hay varias subrutas dentro de una ruta, como por ejemplo `/login` que tiene `/login` y `/login/verify`. El router maneja todas las subrutas de `/login`.

#### Pasar parámetros a la función handler

- Si hago `app.post("/login", handlerLogin)` y quiero pasarle parámetros a `handlerLogin` tengo que hacerlo con un middleware. Por ejemplo si quiero pasarle el secretKey para que lo use en la función, tengo que hacer algo así:

```js
app.post("/login", (req, res) => handlerLogin(req, res, secretKey));
```

También se puede hacer con un middleware que se ejecute antes de la función handler, por ejemplo:

```js
app.post(
  "/login",
  (req, res, next) => {
    req.secretKey = secretKey;
    next();
  },
  handlerLogin
);
```

Otra opción sería hacer un middleware que se ejecute antes de todas las rutas y que guarde el secretKey en el req, para que todas las rutas tengan acceso a él.
Por ejemplo:

```js
app.use((req, res, next) => {
  req.secretKey = secretKey;
  next();
});
```

Otra que handlerLogin sea una función que devuelva otra función, y que la función devuelta sea la que reciba los parámetros:

```js
function handlerLogin (secretKey) => async (req, res) => {
  // hacer algo con secretKey
}
```

### Testing / Vitest

#### Mocking

- Cuando una función que vamos a testear tiene dependencias a las que llama, podemos mockear esas dependencias para que no se ejecuten realmente. Podemos hacerlo o no, dependiendo de si queremos testear la función con sus dependencias reales o no.
- Testear con todas las dependencias reales puede ser útil para testear la integración de las dependencias con la función que estamos testeando. Ya sería más bien un test de integración.
- Testear con las dependencias mockeadas puede ser útil para testear la función sola, sin tener en cuenta las dependencias. Ya sería más bien un test unitario
- En algunos casos es inevitable mockear las dependencias, por ejemplo si la dependencia es una llamada a una API externa, no queremos que el test dependa de la conexión a internet para pasar. También cuando se van a generar valores que vamos a desconocer como el Token de JWT.
- Hay que tener cuidado cuando importamos el modulo de la función a testear porque va a llamar a todos esos imports, y si esos imports llaman a otros imports, etc, vamos a estar llamando a todas las dependencias de la función. Si eso falla en algún momento va a tirar error como me pasaba con la secretKey que era importada dentro de la función que estaba testeando pero daba error porque vitest no podía acceder al .env (podría pasar lo mismo con el acceso a la base de datos).
- Con vitest si hacemos el mock de una dependencia, como trabajar por archivo, hay que hacer el de las otras funciones de ese archivo, o bien indicarle que use las dependencias reales. La sintaxis es por ejemplo así:

```js
vi.mock("../util-auth", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    generateToken: vi.fn(),
  };
});
```

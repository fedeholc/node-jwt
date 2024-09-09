Sí, es posible validar un campo de correo electrónico sin depender del evento `submit` utilizando otros eventos como `input`, `blur`, o `change`. Estos eventos permiten que la validación se ejecute cuando el usuario escribe o cambia de campo, sin necesidad de esperar a que se intente enviar el formulario.

Te mostraré un ejemplo en el que validamos el campo de correo electrónico en tiempo real, usando el evento `input`. Esto validará el formato del correo electrónico mientras el usuario escribe:

### Ejemplo de Validación de Email con el evento `input`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validación de Email en Tiempo Real</title>
    <style>
        .error {
            border-color: red;
        }
        .success {
            border-color: green;
        }
        .error-message {
            color: red;
            display: none;
        }
    </style>
</head>
<body>

<form id="myForm" action="/submit" method="POST">
    <label for="email">Correo Electrónico:</label>
    <input type="email" id="email" name="email" placeholder="ejemplo@dominio.com"><br><br>
    <span id="emailError" class="error-message">Por favor, introduce un correo válido.</span><br><br>

    <button type="submit">Enviar</button>
</form>

<script>
    const emailInput = document.getElementById('email');
    const emailError = document.getElementById('emailError');

    emailInput.addEventListener('input', function() {
        // Usa la validación de correo electrónico del tipo email en HTML5
        if (emailInput.validity.typeMismatch || emailInput.value === '') {
            emailInput.classList.add('error');
            emailInput.classList.remove('success');
            emailError.style.display = 'inline';
        } else {
            emailInput.classList.add('success');
            emailInput.classList.remove('error');
            emailError.style.display = 'none';
        }
    });
</script>

</body>
</html>
```

### Explicación:
- **Evento `input`**: Cada vez que el usuario escribe en el campo de correo electrónico, se ejecuta una función que valida si el correo tiene un formato válido.
- **Validación HTML5 (`type="email"`)**: El campo `input` de tipo `email` utiliza la validación nativa de HTML5 para comprobar si el formato del correo es correcto. La propiedad `validity.typeMismatch` verifica si el valor ingresado no coincide con el formato de un correo electrónico.
- **Estilos**: Si el correo es inválido o el campo está vacío, se muestra un mensaje de error y el campo se marca con borde rojo (`.error`). Si es válido, el borde se vuelve verde (`.success`).
- **Mensaje de error**: El mensaje de error se muestra solo si el correo es inválido.

### Eventos Alternativos:
- **`blur`**: Valida el correo electrónico solo cuando el usuario sale del campo (cuando deja de enfocarlo).
  
```javascript
emailInput.addEventListener('blur', function() {
    // Lógica de validación
});
```

- **`change`**: Valida cuando el usuario cambia el valor del campo y sale de él.

```javascript
emailInput.addEventListener('change', function() {
    // Lógica de validación
});
```

Estos eventos permiten validar campos de formularios dinámicamente, sin necesidad de esperar a la acción de enviar el formulario.
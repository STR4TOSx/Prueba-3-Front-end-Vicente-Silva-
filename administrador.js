// Este evento se dispara cuando todo el contenido del DOM ha sido cargado por completo.
document.addEventListener('DOMContentLoaded', function () {
    // Seleccionamos elementos específicos del DOM para manipular o escuchar algunos eventos
    const adminButton = document.getElementById('boton-administrador');
    const adminSections = document.querySelectorAll('.admin-ocultar');
    const formElement = document.getElementById('formulario-registro').querySelector('form');
    const btnSubmit = formElement.querySelector('button[type="submit"]');
    const usersArea = document.getElementById('users-area');
    
    // Variables para almacenar datos de los usuarios y administrar el CRUD de la aplicación
    let usuarios = [];
    let usuarioEditando = null;
    let paginaActual = 0;

    // Evento para manejar clics en el botón "Administrador", que muestra la interfaz de administración.
    adminButton.addEventListener('click', function() {
        adminSections.forEach(section => {
            section.style.display = 'none'; // Oculta todas las secciones excepto el área de administrador
        });
        formElement.reset(); // Reinicia el formulario a sus valores por defecto.
        btnSubmit.textContent = 'Registrar'; // Establece el texto del botón del formulario.
        usuarioEditando = null; // Restablece el estado de edición.
        document.getElementById('formulario-registro').style.display = 'block';// Muestra el formulario.
        usersArea.style.display = 'block';// Muestra el área donde se listan los usuarios.
        mostrarUsuarios(); // Llama a la función que muestra los usuarios.
    });

    // Maneja el evento de envío del formulario.
    formElement.addEventListener('submit', function(event) {
        event.preventDefault();  // Previene el comportamiento por defecto de un formulario (enviar y recargar la página).
        const usuarioData = {
            nombre: formElement['nombre'].value,
            edad: parseInt(formElement['edad'].value),
            email: formElement['email'].value,
            genero: formElement.querySelector('input[name="genero"]:checked').value,
            suscripcion: formElement['suscripcion'].checked
        };

        if (usuarioEditando !== null) { // Actualiza los datos de un usuario existente si estamos en modo de edición.
            actualizarUsuario(usuarioData);
        } else {
            registrarUsuario(usuarioData); // Registra un nuevo usuario si no estamos editando.
        }
    });

    // Función para registrar un nuevo usuario.
    function registrarUsuario(data) {
        if (usuarioEditando === null) {
            data.id = Date.now();// Asigna un ID único basado en el tiempo actual.
            usuarios.push(data); // Añade el nuevo usuario al array de usuarios.
        }
        mostrarUsuarios(); // Muestra los usuarios actualizados.
        formElement.reset(); // Reinicia el formulario a sus valores por defecto.
        btnSubmit.textContent = 'Registrar'; // Restablece el texto del botón a el valor "Registrar".
        usuarioEditando = null; // Sale del modo de edición.
    }

    // Función para actualizar los datos de un usuario existente.
    function actualizarUsuario(data) {
        const index = usuarios.findIndex(u => u.id === usuarioEditando);
        if (index !== -1) {
            usuarios[index] = { ...usuarios[index], ...data };
        }
        mostrarUsuarios(); // Muestra los usuarios actualizados.
        formElement.reset(); // Reinicia el formulario.
        btnSubmit.textContent = 'Registrar'; // Restablece el texto del botón.
        usuarioEditando = null; // Sale del modo de edición.
    }

    // Función expuesta globalmente para cargar los datos de un usuario en el formulario.
    window.cargarUsuario = function(id) {
        const usuario = usuarios.find(u => u.id === id);
        if (usuario) {
            formElement['nombre'].value = usuario.nombre;
            formElement['edad'].value = usuario.edad;
            formElement['email'].value = usuario.email;
            formElement.querySelector(`input[name="genero"][value="${usuario.genero}"]`).checked = true;
            formElement['suscripcion'].checked = usuario.suscripcion;
            btnSubmit.textContent = 'Guardar'; // Cambia el texto del botón en el formulario a "Guardar".
            usuarioEditando = id; // Establece el modo de edición.
        }
    };

    // Función expuesta globalmente para eliminar un usuario.
    window.eliminarUsuario = function(id) {
        usuarios = usuarios.filter(u => u.id !== id);
        mostrarUsuarios();// Actualiza la visualización de usuarios restantes después de eliminar.
    };

    // Función para mostrar los usuarios en la página. estos son los que se cargan abajo del formulario de ingreso
    function mostrarUsuarios() {
        const inicio = paginaActual * 5;// Calcula el índice del primer usuario en la página actual.
        const fin = inicio + 5;// Calcula el índice del último usuario en la página actual.
        const usuariosPagina = usuarios.slice(inicio, fin); // Obtiene los usuarios para la página actual.

        usersArea.innerHTML = ''; // Limpia el área de usuarios.
        usuariosPagina.forEach((usuario, index) => { // Recorre cada usuario de la página actual y crea un elemento HTML para mostrar su información.
            const usuarioDiv = document.createElement('div'); // Crea un nuevo elemento div.
            usuarioDiv.className = `user-info ${index % 2 === 0 ? 'bg-secondary' : 'bg-dark'}`;  // Asigna clases para el estilo. Aplica una clase diferente dependiendo de si el índice es par o impar para alternar colores.
            // Establece el contenido interno del div, incluyendo los detalles del usuario y botones para actualizar y eliminar.
            usuarioDiv.innerHTML = ` 
                <p>Nombre: ${usuario.nombre}</p>
                <p>Edad: ${usuario.edad}</p>
                <p>Email: ${usuario.email}</p>
                <p>Género: ${usuario.genero}</p>
                <p>Suscripción: ${usuario.suscripcion ? 'Sí' : 'No'}</p>
                <button onclick="cargarUsuario(${usuario.id})">Actualizar</button>
                <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
            `;
            usersArea.appendChild(usuarioDiv); // Agrega el div al área de usuarios en la página.
        });

        if (usuarios.length > 5) { // Si el largo del array es superior a 5 llama a la funcion "cambiarPagina" la cual ordena la informacion a visualizar
            const paginacion = document.createElement('div'); // Crea un elemento de paginación para navegar entre diferentes páginas de usuarios.
            // Agrega botones para moverse entre páginas y muestra la página actual.
            paginacion.innerHTML = `<button onclick="cambiarPagina(-1)">Anterior</button> <span>Página ${paginaActual + 1}</span> <button onclick="cambiarPagina(1)">Siguiente</button>`;
            usersArea.appendChild(paginacion); // Agrega el elemento de paginación al área de usuarios.
        }
    }

    // Función que se expone globalmente para ser llamada desde HTML.
    window.cambiarPagina = function(direccion) {
        const numPaginas = Math.ceil(usuarios.length / 5); // Calcula el número total de páginas basado en el número de usuarios y el número de usuarios por página.
        paginaActual += direccion; // Actualiza el índice de la página actual, incrementándolo o decrementándolo basado en la dirección recibida.
        // Asegura que el índice de la página actual no exceda el número de páginas o sea menor que cero.
        if (paginaActual >= numPaginas) paginaActual = 0; // Si se excede, vuelve al inicio.
        if (paginaActual < 0) paginaActual = numPaginas - 1; // Si es negativo, va a la última página.
        mostrarUsuarios(); // Llama a la función mostrarUsuarios para actualizar la interfaz con los usuarios de la nueva página.
    };
});

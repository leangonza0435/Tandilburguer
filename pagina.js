// Variables globales
let carrito = [];
let mesaSeleccionada = 0;

// Selección de mesa
const mesaSelect = document.getElementById("mesa");
mesaSelect.addEventListener("change", (e) => {
    mesaSeleccionada = e.target.value;
    console.log(`Mesa seleccionada: ${mesaSeleccionada}`);
});

// Agregar productos al carrito
const botonesAgregar = document.querySelectorAll(".agregarCarrito");
botonesAgregar.forEach((boton) => {
    boton.addEventListener("click", (e) => {
        const nombreProducto = e.target.getAttribute("data-nombre");
        const precioProducto = parseInt(e.target.getAttribute("data-precio"));
        
        // Obtener el tamaño de papas y bebida seleccionados
        const tamañoPapas = e.target.closest('.producto').querySelector('.selectTamaño') ? e.target.closest('.producto').querySelector('.selectTamaño').value : null;
        const bebida = e.target.closest('.producto').querySelector('.selectBebida') ? e.target.closest('.producto').querySelector('.selectBebida').value : null;

        // Si es el Combo Familiar, tomar las dos bebidas elegidas
        let bebidasCombo = [];
        if (nombreProducto === "Combo Familiar") {
            bebidasCombo = Array.from(e.target.closest('.producto').querySelectorAll('.selectBebida'))
                .map(select => select.value)
                .filter(value => value);
        }

        // Comprobar si el producto ya existe en el carrito
        const productoExistente = carrito.find(producto => producto.nombre === nombreProducto && producto.tamaño === tamañoPapas && JSON.stringify(producto.bebidas) === JSON.stringify(bebidasCombo) && producto.bebida === bebida);

        if (productoExistente) {
            productoExistente.cantidad += 1;
        } else {
            carrito.push({
                nombre: nombreProducto,
                precio: precioProducto,
                cantidad: 1,
                tamaño: tamañoPapas,
                bebida: bebida,
                bebidas: bebidasCombo
            });
        }

        mostrarCarrito();
    });
});

// Función para mostrar el carrito
function mostrarCarrito() {
    const carritoDiv = document.getElementById("productosCarrito");
    const totalDiv = document.getElementById("totalCarrito");

    carritoDiv.innerHTML = '';
    let total = 0;

    carrito.forEach((producto) => {
        let detalleProducto = `${producto.nombre} - $${producto.precio} x ${producto.cantidad}`;

        if (producto.tamaño) {
            detalleProducto += ` (Tamaño: ${producto.tamaño === '150' ? 'Clásicas' : 'Grandes'})`;
        }

        // Mostrar bebidas seleccionadas con el precio correspondiente en el Combo Familiar
        if (producto.bebidas.length > 0 && producto.nombre === 'Combo Familiar') {
            const bebidasTexto = producto.bebidas.map(bebida => `${obtenerNombreBebida(bebida)} ($${obtenerPrecioBebida(bebida)})`).join(', ');
            detalleProducto += ` (Bebidas: ${bebidasTexto})`;
        } else if (producto.bebida) {
            const nombreBebida = obtenerNombreBebida(producto.bebida);
            const precioBebida = obtenerPrecioBebida(producto.bebida);
            detalleProducto += ` (Bebida: ${nombreBebida} - $${precioBebida})`;
        }

        carritoDiv.innerHTML += `<p>${detalleProducto}</p>`;
        total += producto.precio * producto.cantidad;
    });

    totalDiv.innerHTML = `Total: $${total}`;
    document.getElementById("carrito").style.display = 'block';
    agregarEventosEliminar();
}

// Función para obtener el nombre de la bebida según el valor
function obtenerNombreBebida(bebida) {
    switch (bebida) {
        case '100':
            return 'Coca Cola';
        case '101':
            return 'Fanta';
        case '102':
            return 'Sprite';
        case '103':
            return 'Coca Cola Zero';
        case '50':
            return 'Agua';
        case '75':
            return 'Agua Saborizada';
        default:
            return 'Bebida desconocida';
    }
}

// Función para obtener el precio de la bebida según el valor
function obtenerPrecioBebida(bebida) {
    switch (bebida) {
        case '100':
        case '101':
        case '102':
        case '103':
            return 100;
        case '50':
            return 50;
        case '75':
            return 75;
        default:
            return 0;
    }
}

// Eliminar productos del carrito
function agregarEventosEliminar() {
    const botonesEliminar = document.querySelectorAll(".eliminarProducto");
    botonesEliminar.forEach((boton) => {
        boton.addEventListener("click", (e) => {
            const nombreProducto = e.target.getAttribute("data-nombre");
            const tamaño = e.target.getAttribute("data-tamaño");
            const bebida = e.target.getAttribute("data-bebida");
            const bebidas = e.target.getAttribute("data-bebidas").split(', ');

            carrito = carrito.filter((producto) => !(producto.nombre === nombreProducto && producto.tamaño === tamaño && producto.bebida === bebida && JSON.stringify(producto.bebidas) === JSON.stringify(bebidas)));
            mostrarCarrito();
        });
    });
}

// Vaciar carrito
document.getElementById("vaciarCarrito").addEventListener("click", () => {
    carrito = [];
    mostrarCarrito();
    document.getElementById("carrito").style.display = 'none';
});

// Confirmar pedido
document.getElementById("confirmarPedido").addEventListener("click", () => {
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
    } else {
        alert(`Pedido confirmado. Mesa: ${mesaSeleccionada}`);

        // Crear el objeto del pedido
        const pedido = {
            mesa: mesaSeleccionada,
            productos: carrito.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                tamaño: item.tamaño,
                bebida: item.bebida,
                bebidas: item.bebidas
            })),
            fecha: new Date().toISOString()
        };

        console.log("Pedido a enviar a Firebase:", pedido);

        // Subir el pedido a Firebase
        db.ref('pedidos').push(pedido)
            .then(() => {
                console.log("Pedido guardado exitosamente en Firebase");

                // Vaciar el carrito después de confirmar el pedido
                carrito = [];
                mostrarCarrito();
                document.getElementById("carrito").style.display = 'none';
            })
            .catch((error) => {
                console.error("Error al guardar el pedido:", error);
            });
    }
});

// Mostrar u ocultar carrito
const carritoDiv = document.getElementById("carrito");
const carritoBtn = document.getElementById("carritoBtn");
carritoBtn.addEventListener("click", () => {
    if (carritoDiv.style.display === 'none' || carritoDiv.style.display === '') {
        carritoDiv.style.display = 'block';
        carritoBtn.style.position = 'absolute';
        carritoBtn.style.top = '20px';
    } else {
        carritoDiv.style.display = 'none';
        carritoBtn.style.position = 'fixed';
        carritoBtn.style.bottom = '20px';
    }
});
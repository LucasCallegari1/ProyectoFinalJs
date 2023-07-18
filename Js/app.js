/*
    Objetivos del Proyecto final.
    - Objetos y arrays. Métodos de Arrays.
    - Funciones y condicionales.
    - Al menos una librería.
    - DOM.
    - Eventos.
    - Storage.
    - Promesas con fetch.
    - Carga de datos desde un JSON local o API externa.
*/

class BaseDeDatos {
    constructor() {
        //Array de mis productos
        this.productos = [];
    }
    async devolverRegistros() {
        const response = await fetch("./productos.json");
        this.productos = await response.json();
        return this.productos;
    } 
    registroPorId(id) {
        return this.productos.find((producto) => producto.id === id);
    }
    registroPorNombre(palabra) {
        return this.productos.filter((producto) => producto.nombre.toLowerCase().includes(palabra));
    }
    registroPorCategoria(categoria) {
        return this.productos.filter((producto) => producto.categoria == categoria);
    }
}

class Carrito{
    constructor(){
        const carritoStorage = JSON.parse(localStorage.getItem("carrito"));
        this.carrito = carritoStorage || [];
        this.total = 0;
        this.totalProductos = 0;
        this.listar();
    }
    estaEnCarrito({ id }) {
        return this.carrito.find((producto => producto.id === id));
    }
    agregar(producto) {
        let productoEnCarrito = this.estaEnCarrito(producto);
        if (productoEnCarrito){
            productoEnCarrito.cantidad++;
        } else {
            this.carrito.push({ ...producto, cantidad: 1 });
        }
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar(); 
        // Toastify
        Toastify({
            text:`¡ ${producto.nombre} fue agregado al carrito !` ,
            className: "info",
            gravity: "bottom", 
            position: "center",
            style: {
                background: "linear-gradient(to right, #333, #403D37)",
            }
        }).showToast();
    }
    quitar(id) {
        const indice = this.carrito.findIndex((producto) => producto.id === id);
        if (this.carrito[indice].cantidad > 1) {
            this.carrito[indice].cantidad--;
        } else {
            this.carrito.splice(indice, 1);
        }
        localStorage.setItem("carrito", JSON.stringify(this.carrito));
        this.listar();
    }
    listar() {
        this.total = 0;
        this.totalProductos = 0;
        divCarrito.innerHTML = "";
        for (const producto of this.carrito){
            divCarrito.innerHTML += `
            <div class="producto productoCarrito">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio}</p>
            <p>Cantidad: ${producto.cantidad}</p>
            <a href="#" data-id="${producto.id}"  class="btn btnQuitar">Quitar del carrito</a>
            </div> 
            `
            this.total += producto.precio * producto.cantidad;
            this.totalProductos += producto.cantidad;
        }
        if (this.totalProductos > 0) {
            botonComprar.classList.remove("oculto");
        } else {
            botonComprar.classList.add("oculto");
        }
        const botonesQuitar = document.querySelectorAll(".btnQuitar");
        for (const boton of botonesQuitar) {
            boton.addEventListener("click", (event) => {
                event.preventDefault();
                this.quitar(Number(boton.dataset.id));
            });
        }
        spanCantidadProductos.innerText = this.totalProductos;
        spanTotalCarrito.innerText = this.total;
    }
    vaciar(){
        this.carrito = [];
        localStorage.removeItem('carrito');
        this.listar();
    }
}
class Producto {
    constructor(id, nombre, precio, categoria, imagen = false) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.imagen = imagen;
    }
}

const bd = new BaseDeDatos();

// Nodos
const divProductos = document.querySelector("#productos");
const divCarrito = document.querySelector("#carrito");
const spanCantidadProductos = document.querySelector("#cantidadProducto");
const spanTotalCarrito = document.querySelector("#totalCarrito");
const inputBuscar = document.querySelector("#inputBuscar");
const botonCarrito = document.querySelector("section h1");
const botonesCategorias = document.querySelectorAll(".btnCategoria");
const botonTodos = document.querySelector("#btnTodos");
const botonComprar = document.querySelector("#botonComprar");


botonesCategorias.forEach((boton) => {
    boton.addEventListener("click", (event) => {
        event.preventDefault();
        quitarClaseSeleccionado();
        boton.classList.add("seleccionado");
        const productosPorCategoria = bd.registroPorCategoria(boton.innerText);
        cargarProductos(productosPorCategoria);
    });
});

botonTodos.addEventListener("click", (event) => {
        event.preventDefault();
        quitarClaseSeleccionado();
        botonTodos.classList.add("seleccionado");
        cargarProductos(bd.productos);
    });

function quitarClaseSeleccionado() {
    const botonSeleccionado = document.querySelector(".seleccionado");
        if (botonSeleccionado){
            botonSeleccionado.classList.remove("seleccionado");
        } 
}
// Llamo a la función.
bd.devolverRegistros().then((productos) => cargarProductos(productos));

function cargarProductos(productos) {
    divProductos.innerHTML = "";
    for (const producto of productos) {
        divProductos.innerHTML += `
        <div class="producto">
            <h2>${producto.nombre}</h2>
            <p>$${producto.precio}</p>
            <img src="img/${producto.imagen}" width ="150" />
            <p><a href="#" class="btn btnAgregar" data-id="${producto.id}">Agregar al carrito</a></p>
        </div>
        `;
    } 
    const botonesAgregar = document.querySelectorAll(".btnAgregar");
    for (const boton of botonesAgregar){
        boton.addEventListener("click", (event) =>{  event.preventDefault();
            const id = Number(boton.dataset.id);
            const producto = bd.registroPorId(id);
            carrito.agregar(producto);            
        });
    }
}

inputBuscar.addEventListener("keyup", (event) => {
    event.preventDefault();
    const palabra = inputBuscar.value;
    cargarProductos(bd.registroPorNombre(palabra.toLowerCase()));
});

botonCarrito.addEventListener("click", () => {
    document.querySelector("section").classList.toggle("ocultar")
});

botonComprar.addEventListener("click", () =>{
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Tu pedido está en camino',
        text: '¡ Tu compra, ha sido realizada con éxito !',
        ConfirmButtonText: 'OK',
        timer: 3000
    });
    carrito.vaciar();
    botonComprar.className = "oculto";
});

const carrito = new Carrito();
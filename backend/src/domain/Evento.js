import { Usuario } from './Usuario.js';
import { Categoria } from './Categoria.js';

export class Evento {
    constructor({
        id = null,
        nombre,
        descripcion,
        categoria,
        fecha,
        tiposEntrada = [],
        multimedia = [],
        organizador
    }) {
        if (!(organizador instanceof Usuario)) {
            throw new Error('El atributo "organizador" debe ser una instancia de Usuario');
        }
        if (!(categoria instanceof Categoria)) {
            throw new Error('El atributo "categoria" debe ser una instancia de Categoria');
        }

        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.categoria = categoria;
        this.fecha = fecha instanceof Date ? fecha : new Date(fecha);
        this.tiposEntrada = tiposEntrada;
        this.multimedia = multimedia;
        this.organizador = organizador;
    }

    tuPrecioEstaEntre(min, max) {
        return this.tiposEntrada.some(
            (tipo) => tipo.precio >= min && tipo.precio <= max
        );
    }

    precioMinimo() {
        if (!this.tiposEntrada || this.tiposEntrada.length === 0) {
            return 0;
        }
        return Math.min(...this.tiposEntrada.map((tipo) => tipo.precio));
    }
}

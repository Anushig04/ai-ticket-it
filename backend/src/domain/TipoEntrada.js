import { DomainError } from '../errors/DomainError.js';

export class TipoEntrada {
    constructor({ id = null, nombre, descripcion = '', precio, cupo }) {
        if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
            throw new DomainError('El nombre del tipo de entrada es obligatorio', 400);
        }
        const precioNum = Number(precio);
        const cupoNum = Number(cupo);
        if (Number.isNaN(precioNum) || precioNum < 0) {
            throw new DomainError('El precio del tipo de entrada debe ser mayor o igual a 0', 400);
        }
        if (Number.isNaN(cupoNum) || cupoNum < 0) {
            throw new DomainError('El cupo del tipo de entrada no puede ser negativo', 400);
        }
        this.id = id;
        this.nombre = nombre.trim();
        this.descripcion = descripcion;
        this.precio = precioNum;
        this.cupo = cupoNum;
    }

    hayCupoPara(cantidad) {
        return cantidad > 0 && this.cupo >= cantidad;
    }

    descontarCupo(cantidad) {
        if (!this.hayCupoPara(cantidad)) {
            throw new DomainError(
                `No hay cupo suficiente para el tipo de entrada "${this.nombre}". Cupo disponible: ${this.cupo}`,
                409
            );
        }
        this.cupo -= cantidad;
    }

    restituirCupo(cantidad) {
        if (cantidad > 0) {
            this.cupo += cantidad;
        }
    }
}

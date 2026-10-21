export class TipoEntrada {
    constructor({ id = null, nombre, descripcion, precio, cupo }) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = Number(precio);
        this.cupo = Number(cupo);
    }

    hayCupoPara(cantidad) {
        return cantidad > 0 && this.cupo >= cantidad;
    }

    descontarCupo(cantidad) {
        if (!this.hayCupoPara(cantidad)) {
            throw new Error(`No hay cupo suficiente para el tipo de entrada "${this.nombre}". Cupo disponible: ${this.cupo}`);
        }
        this.cupo -= cantidad;
    }

    restituirCupo(cantidad) {
        if (cantidad > 0) {
            this.cupo += cantidad;
        }
    }
}

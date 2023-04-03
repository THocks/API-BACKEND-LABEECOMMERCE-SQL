export type TUser = {
    id: string,
    email: string,
    password: string
  }

export type TProduct = {
    id: string,
    name: string,
    price: number,
    category: CATEGORIES
}

export type TPurchase = {
    userId: string,
    productId: string,
    quantity: number,
    totalPrice: number
}

export enum CATEGORIES {
    FUNKO = 'Funko HarryPother',
    ALMOFODAS = "AlfomadaGamer",
    BRINQUENDOS= "Boneco Articulado Homem Aranha"
}
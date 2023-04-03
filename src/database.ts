
import { CATEGORIES, TProduct, TPurchase, TUser } from "./types";

export const users: TUser[] = [
    {
        id: "u001",
        email: "exaltasamba@gmail.com",
        password: "7845120"
    },
    {
        id: "u002",
        email: "turmadopagode@gmail.com",
        password: "784512tt"
    },
    {
        id: "u003",
        email: "filhosdoexu@gmail.com",
        password: "784512tt@"
    },
    {
        id: "u004",
        email: "teste@gmail.com",
        password: "784512tt@t"
    }
]

export const products: TProduct[] = [
    {
        id: "1",
        name: "Funko Hermione",
        price: 69.90,
        category: CATEGORIES.FUNKO
    },
    {
        id: "2",
        name: "Funko Star Wars",
        price: 69.90,
        category: CATEGORIES.FUNKO
    },
]

export const purchases: TPurchase[] = [
    {
        userId: users[0].id,
        productId: products[0].id,
        quantity: 2,
        totalPrice: products[0].price * 2
    },
    {
        userId: users[1].id,
        productId: products[1].id,
        quantity: 1,
        totalPrice: products[1].price * 1
    },
]

export const createUser = (id: string, email: string, password: string): void => {

    const user = users.find(
        (user) => {
            return user.email === email || user.id === id
        }
    )

    if (!user) {
        const newUser: TUser = {
            id: id,
            email: email,
            password: password
        }

        console.log("Cadastro realizado com sucesso!")
        users.push(newUser)
    } else {
        console.log("Usuário já cadastrado em nosso sistema")
    }

}

export const getAllUsers = (): void => {
    const allUsers = users.map((user) => { return user.email })
    console.log("Todos os usuários:", allUsers)
}

export const createProduct = (id: string, name: string, price: number, category: CATEGORIES): void => {

    const product = products.find(
        (product) => {
            return product.name === name || product.id === id
        }
    )

    if (!product) {
        const newProduct: TProduct = {
            id: id,
            name: name,
            price: price,
            category: category
        }
        console.log("Produto criado com sucesso!")
        products.push(newProduct)
    } else {
        console.log("Produto já existe em nosso estoque")
    }
}

export const getProductById = (id: string): TProduct | undefined => {
    return products.find(
        (product) => {
            return product.id === id
        }
    )
}

export const queryProductsByName = (query:string):void => {
    
    if(query){
        const queryProducts:TProduct[] = products.filter(
            (product) => {
              return product.name.toLowerCase().includes(query.toLowerCase())
            }
          )
    
          queryProducts.length > 0 ? console.log(queryProducts.map((product) => {return product.name})) : console.log("Nenhum produto foi achado!")
    } else {
        console.log("Não encontramos o produto")
    }
    
}

  export const createPurchase = (userId:string, productId:string, quantity:number, totalPrice:number):void => {
            if(userId.length > 0){
                const newPurchase:TPurchase = {
                    userId: userId,
                    productId: productId,
                    quantity: quantity,
                    totalPrice: totalPrice
                }

                console.log("Compra realizada com sucesso!")
                purchases.push(newPurchase)
            } else {
                console.log("Não encontramos as informações passada")
            }
}

export const getAllPurchasesFromUserId = (userIdToSearch: string):void => {

    const userId = users.find((user) =>  user.id === userIdToSearch)

    if(userId){
        const allPurchases = purchases.filter(
            (purchase) => {
                return purchase.userId === userIdToSearch
            }
        )

        allPurchases.length > 0 ? console.log("Compras", allPurchases) : console.log("Verifique o carrinho")
    } else {
        console.log("Id não encontrado no sistema")
    }
}
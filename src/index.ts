import express, { Request, Response } from 'express';
import cors from 'cors';
import { products, purchases, users } from './database';
import Joi, { ValidationError } from "joi";
import { TProduct, TUser, CATEGORIES, TPurchase } from './types';

const app = express();
app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log('Servidor rodando na porta 3003');
});

app.get('/ping', (req: Request, res: Response) => {
  res.send('Pong!');
});

app.get('/users', (req: Request, res: Response) => {
  try {
    if (users.length <= 0) {
      res.status(404);
      throw new Error('Não existem usuários cadastrados.');
    }
    res.status(200).send(users);
  } catch (error: any) {
    console.log(error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
  }
});

app.get('/products', (req: Request, res: Response) => {
    try {
      if (products.length <= 0) {
        res.status(404);
        throw new Error('Não existem produtos cadastrados.');
      }
      res.status(200).send(products);
    } catch (error: any) {
      console.log(error);
      res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
    }
  });

  app.get('/products/search', (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        q: Joi.string().min(1).required(),
      });
      const { error } = schema.validate(req.query);
      if (error) {
        res.status(400);
        throw new Error(error.message);
      }
  
      const q = req.query.q as string;
  
      const result = products.filter((product) => {
        return product.name.toLowerCase().includes(q.toLowerCase());
      });
  
      if (result.length === 0) {
        res.status(404);
        throw new Error('Produto não encontrado.');
      }
  
      res.status(200).send(result);
    } catch (error: any) {
      console.log(error);
      res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
    }
  });

  app.get('/purchases', (req: Request, res: Response) => {
    try {
      if (purchases.length <= 0) {
        res.status(404);
        throw new Error('Não existem compras realizadas.');
      }
      res.status(200).send(purchases);
    } catch (error: any) {
      console.log(error);
      res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
    }
  });


const productIdSchema = Joi.string().required()

app.get('/products/:id', (req: Request, res: Response) => {
    try {
      // Valida o parâmetro da rota
      const { error } = productIdSchema.validate(req.params.id)
      if (error) {
        res.status(400)
        throw new Error(error.message)
      }
  
      const id = req.params.id
      const result = products.find((product) => product.id === id)
  
      if (!result) {
        res.status(404)
        throw new Error('Não foi encontrado nenhum produto. Verifique a "id" e tente novamente.')
      }
  
      res.status(200).send(result)
  
    } catch (error: any) {
      if (res.statusCode === 200) {
        res.status(500)
        res.send("Erro inesperado.")
      }
  
      res.send(error.message)
      console.log(error)
    }
  })

const userIdSchema = Joi.string().uuid({ version: 'uuidv4' });

app.get('/users/:id/purchases', (req: Request, res: Response) => {
    try {
        const { error: userIdError } = userIdSchema.validate(req.params.id);
        if (userIdError) {
            res.status(400);
            throw new Error('Id de usuário inválido. Verifique e tente novamente.');
        }

        const user = users.find((user) => user.id === req.params.id);
        if (!user) {
            res.status(400);
            throw new Error('Usuário não encontrado. Verifique o id e tente novamente.');
        }

        const result = purchases.filter((purchase) => purchase.userId.includes(req.params.id));
        if (result.length === 0) {
            res.status(404);
            throw new Error('Nenhuma compra encontrada para o usuário informado.');
        }

        res.status(200).send(result);
    } catch (error: any) {
        console.error(error);
        res.status(error.status || 500).send({ error: error.message });
    }
});

const idSchema = Joi.string().required()
const emailSchema = Joi.string().email().required()
const passwordSchema = Joi.string().min(8).max(12).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).*$/).required()

app.post('/users', (req: Request, res: Response) => {

    try {
        const { error } = Joi.object({
            id: idSchema,
            email: emailSchema,
            password: passwordSchema
        }).validate(req.body)

        if (error) {
            res.status(400)
            throw new Error(`Dados inválidos. ${error.message}`)
        }

        const { id, email, password } = req.body

        const userId = users.find((user) => user.id === id)
        if (userId) {
            res.status(400)
            throw new Error('Não é possível criar mais de uma conta com a mesma id. Tente novamente.')
        }

        const userEmail = users.find((user) => user.email === email)
        if (userEmail) {
            res.status(400)
            throw new Error('Não deve é possível criar mais de uma conta com o mesmo e-mail. Tente novamente.')
        }

        const newUser: TUser = {
            id,
            email,
            password
        }

        users.push(newUser)
        res.status(201).send("Cadastro realizado com sucesso!")
        
    } catch (error: any) {
        console.log(error)

        if(res.statusCode === 200){
            res.status(500)
            res.send("Erro inesperado.")
        }

        res.send(error.message)
    }
})


app.post("/products", (req: Request, res: Response) => {
    try {
      const schema = Joi.object({
        id: Joi.string().required(),
        name: Joi.string().min(1).required(),
        price: Joi.number().required(),
        category: Joi.string()
          .valid(CATEGORIES.FUNKO, CATEGORIES.BRINQUENDOS, CATEGORIES.ALMOFODAS)
          .required(),
      });
  
      const { error } = schema.validate(req.body);
      if (error) {
        res.status(400);
        throw new Error(error.message);
      }
  
      const { id, name, price, category } = req.body;
  
      const productId = products.find((product) => product.id === id);
      if (productId) {
        res.status(400);
        throw new Error("Não é possível criar mais de uma conta com a mesma id. Tente novamente.");
      }
  
      const newProduct: TProduct = {
        id,
        name,
        price,
        category,
      };
  
      products.push(newProduct);
      res.status(201).send("Produto cadastrado com sucesso!");
    } catch (error: any) {
      console.log(error);
  
      if (res.statusCode === 200) {
        res.status(500);
        res.send("Erro inesperado.");
      }
  
      res.send(error.message);
    }
  })

  const purchaseSchema = Joi.object({
    userId: Joi.string().required(),
    productId: Joi.string().required(),
    quantity: Joi.number().integer().positive().required(),
    totalPrice: Joi.number().required(),
  })
  
  app.post('/purchases', (req: Request, res: Response) => {
    try {
      const { error } = purchaseSchema.validate(req.body)
      if (error) {
        res.status(400)
        throw new Error(error.details[0].message)
      }
  
      const userId = req.body.userId as string
      const productId = req.body.productId as string
      const quantity = req.body.quantity as number
      const totalPrice = req.body.totalPrice as number
  
      const user = users.find((user) => user.id === userId)
      if (!user) {
        res.status(404)
        throw new Error('Usuário não foi encontrado, verifique a "id".')
      }
  
      const product = products.find((product) => product.id === productId)
      if (!product) {
        res.status(404)
        throw new Error('Produto não foi encontrado, verifique a "id".')
      }
  
      if (product.price * quantity !== totalPrice) {
        res.status(400)
        throw new Error('O preço total está errado, verifique novamente.')
      }
  
      const newPurchase: TPurchase = {
        userId,
        productId,
        quantity,
        totalPrice,
      }
  
      purchases.push(newPurchase)
      res.status(201).send('Compra realizada com sucesso!')
    } catch (error: any) {
      console.log(error)
  
      if (res.statusCode === 200) {
        res.status(500)
        res.send('Erro inesperado.')
      }
  
      res.send(error.message)
    }
  })





  app.delete('/products/:id', (req: Request, res: Response) => {
    try {
      const { error: validationError } = Joi.object({
        id: Joi.string().required(),
      }).validate(req.params);
  
      if (validationError) {
        res.status(400);
        throw new Error(validationError.message);
      }
  
      const id = req.params.id;
      const product = products.find((product) => product.id === id);
  
      if (!product) {
        res.status(400);
        throw new Error('Produto não existe.');
      }
  
      const productIndex = products.findIndex((product) => product.id === id);
      if (productIndex >= 0) {
        products.splice(productIndex, 1);
      }
  
      res.status(200).send('Produto deletado com sucesso!');
    } catch (error: any) {
      console.log(error);
  
      if (res.statusCode === 200) {
        res.status(500);
        res.send('Erro inesperado.');
      }
  
      res.send(error.message);
    }
  });

  const userSchema = Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/).optional(),
  })
  
  app.put('/users/:id', (req: Request, res: Response) => {
    try {
      const { error } = userSchema.validate(req.body)
      if (error) {
        res.status(400).send(error.details[0].message)
        return
      }
  
      const id = req.params.id
      const { email, password } = req.body
      
      const user = users.find((user) => user.id === id)
  
      if(!user){
          res.status(400)
          throw new Error('Usuário não existe.')
      }
  
      if (email !== undefined) {
          user.email = email
      }
  
      if (password !== undefined) {
          user.password = password
      }
  
      res.status(200).send('Atualização realizada com sucesso')
  
    } catch (error:any) {
        console.log(error)
  
        if(res.statusCode === 200){
            res.status(500)
            res.send("Erro inesperado.")
        }
  
        res.send(error.message)
    }
  })

  const productSchema = Joi.object({
    name: Joi.string().min(1),
    price: Joi.number().min(0),
    category: Joi.string().valid(CATEGORIES.FUNKO, CATEGORIES.BRINQUENDOS, CATEGORIES.ALMOFODAS)
  })

  app.put('/products/:id', (req: Request, res: Response) => {

    try {
        const id = req.params.id
      
        const { error, value } = productSchema.validate(req.body)
        if (error) {
          res.status(400)
          throw new Error(error.message)
        }
      
        const { name, price, category } = value
      
        const product = products.find((product) => product.id === id)
      
        if (!product) {
          res.status(400)
          throw new Error('Produto não existe.')
        }
      
        if (name !== undefined) {
          product.name = name
        }
      
        if (price !== undefined) {
          product.price = price
        }
      
        if (category !== undefined) {
          product.category = category
        }
      
        res.status(200).send('Atualização realizada com sucesso')
      
      } catch (error: any) {
        console.log(error)
      
        if (res.statusCode === 200) {
          res.status(500)
          res.send('Erro inesperado.')
        }
      
        res.send(error.message)
      }
})
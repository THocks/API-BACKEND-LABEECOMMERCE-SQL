import express, { Request, Response } from 'express';
import cors from 'cors';
import { products, purchases, users } from './database';
import Joi, { ValidationError } from "joi";
import { TProduct, TUser, CATEGORIES, TPurchase } from './types';
import { db } from './knex';

const app = express();
app.use(express.json());
app.use(cors());

app.listen(3005, () => {
  console.log('Servidor rodando na porta 3005');
});

app.get('/ping', (req: Request, res: Response) => {
  res.send('Pong!');
});

app.get('/users', async (req: Request, res: Response) => {
  try {
    const result = await db.raw(`
    SELECT * FROM usuarios
  `)
 
    res.status(200).send(result);
  } catch (error: any) {
    console.log(error);
    res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
  }
});
/*****************************GET PRODUCTS **************************************************** */
app.get('/products', async (req: Request, res: Response) => {
    try {
      const result = await db.raw(`
      SELECT * FROM products
    `)

      res.status(200).send(result);
    } catch (error: any) {
      console.log(error);
      res.status(res.statusCode === 200 ? 500 : res.statusCode).send(error.message);
    }
  });
  /******************************GET PRODUCT / SEARCH************************************************/

  app.get('/products/search', async (req: Request, res: Response) => {
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
  
      const result = await db('products')
        .where('name', 'like', `%${q}%`);
  
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
  
/********************************GET Purchase *************/

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

/*****************************GET PRODUCTS ID********************************************* */
const productIdSchema = Joi.string().required()

app.get('/products/:id', async (req: Request, res: Response) => {
  try {
    // Valida o parâmetro da rota
    const { error } = productIdSchema.validate(req.params.id)
    if (error) {
      res.status(400)
      throw new Error(error.message)
    }

    const id = req.params.id
    
    const result = await db('products').where('id', id).first()

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

/********************************getUsersIdPurchase ******************************************/


app.get('/users/:id/purchases', async (req: Request, res: Response) => {
  try {
  
    const user = await db('usuarios').where('id', req.params.id).first();
    if (!user) {
      res.status(400);
      throw new Error('Usuário não encontrado. Verifique o id e tente novamente.');
    }

    const purchases = await db('purchases').where('user_id', req.params.id);
    if (purchases.length === 0) {
      res.status(404);
      throw new Error('Nenhuma compra encontrada para o usuário informado.');
    }

    res.status(200).send(purchases);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).send({ error: error.message });
  }
});

/************************************POST USERS *********************************************** */
const idSchema = Joi.string().required()
const emailSchema = Joi.string().email().required()
const passwordSchema = Joi.string().min(8).max(12).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).*$/).required()

interface User {
  id: string;
  email: string;
  password: string;
}





app.post('/users', async (req: Request, res: Response) => {
  let transaction = null;
  try {
    const { error } = Joi.object({
      userS: Joi.array().items(Joi.object({
        id: idSchema,
        email: emailSchema,
        senha: passwordSchema
      })).required()
    }).validate(req.body)

    if (error) {
      return res.status(400).send({ message: `Dados inválidos. ${error.message}` })
    }

    const { userS } = req.body

    const existingIds = userS.filter((user: User) => {
      return userS.some((u: User) => u !== user && u.id === user.id)
    })
    if (existingIds.length > 0) {
      return res.status(400).send({ message: 'Não é possível criar mais de uma conta com a mesma id. Tente novamente.' })
    }

    const existingEmails = userS.filter((user: User) => {
      return userS.some((u: User) => u !== user && u.email === user.email)
    })
    if (existingEmails.length > 0) {
      return res.status(400).send({ message: 'Não é possível criar mais de uma conta com o mesmo e-mail. Tente novamente.' })
    }

    transaction = await db.transaction();
    const insertedUsers = await transaction("usuarios").insert(userS).returning("*");
    await transaction.commit();

    res.status(201).send(insertedUsers)
  } catch (error: any) {
    console.error(error)
    if (transaction) {
      await transaction.rollback()
    }
    res.status(500).send({ message: "Erro inesperado." })
  }
})


/*******************************PRODUCTS POST ******************** */

app.post('/products', async (req: Request, res: Response) => {
  let transaction = null;
  try {
    const { error } = Joi.object({
      products: Joi.array().items(Joi.object({
        name: Joi.string().min(1).required(),
        price: Joi.number().required(),
        category_id: Joi.number().required()
      })).required()
    }).validate(req.body)

    if (error) {
      return res.status(400).send({ message: `Dados inválidos. ${error.message}` })
    }

    const { products } = req.body;
    console.log(products);
    transaction = await db.transaction();

    // Check if all category ids in the request are valid
    const validCategoryIds = await transaction("categories").pluck("id");
    const invalidCategoryIds = products.map((product: any) => product.category_id)
      .filter((categoryId: any) => !validCategoryIds.includes(categoryId));

    if (invalidCategoryIds.length > 0) {
      await transaction.rollback();
      return res.status(400).send({ message: `Categoria(s) inválida(s): ${invalidCategoryIds.join(", ")}` });
    }

    const insertedProducts = await transaction("products").insert(products).returning("*");
    await transaction.commit();

    res.status(201).send(insertedProducts)
  } catch (error: any) {
    console.error(error)
    if (transaction) {
      await transaction.rollback()
    }
    res.status(500).send({ message: "Erro inesperado." })
  }
})



  



/***************************POST PURCHASE****************************** */
const purchaseSchema = Joi.object({
  userId: Joi.string().required(),
  productId: Joi.string().required(),
  quantity: Joi.number().integer().positive().required(),
  totalPrice: Joi.number().required(),
})

app.post('/purchases', async (req: Request, res: Response) => {
  const trx = await db.transaction();
  try {
    const { error } = purchaseSchema.validate(req.body);
    if (error) {
      await trx.rollback();
      res.status(400);
      throw new Error(error.details[0].message);
    }
  
    const userId = req.body.userId as string;
    const productId = req.body.productId as string;
    const quantity = req.body.quantity as number;
    const totalPrice = req.body.totalPrice as number;

    const user = await trx('usuarios').where('id', userId)
    if (!user) {
      await trx.rollback();
      res.status(404);
      throw new Error('Usuário não foi encontrado, verifique a "id".');
    }
   



    const product = await trx('products').where('id', productId).first();
    if (!product) {
      await trx.rollback();
      res.status(404);
      throw new Error('Produto não foi encontrado, verifique a "id".');
    }

    if (product.price * quantity !== totalPrice) {
      await trx.rollback();
      res.status(400);
      throw new Error('O preço total está errado, verifique novamente.');
    }

    const newPurchase = {
      userId,
      productId,
      quantity,
      totalPrice,
    };

    await trx('purchases').insert(newPurchase);
    await trx.commit();
    res.status(201).send('Compra realizada com sucesso!');
  } catch (error: any) {
    console.log(error);

    await trx.rollback();
    res.status(500).send('Erro inesperado: ' + error.message);
  }
});


 /****************************************************************** */




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

  /***********************PUT USER ID******************* */
  
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
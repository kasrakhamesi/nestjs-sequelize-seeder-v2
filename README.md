<p align="center">
  <a href="https://github.com/kasrakhamesi/nestjs-sequelize-seeder-v2" target="blank"><img src="https://i.ibb.co/R3M1w4n/nestjs-svg-1.png" width="120" alt="Nestjs Sequelize Seeder Logo" /></a>
</p>

<p align="center">
🌾 A simple extension library for nestjs sequelize to perform seeding.
</p>
<p align="center" style="max-width: 450px; margin: auto;">
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
   <a href="https://github.com/kasrakhamesi/nestjs-sequelize-seeder-v2" title="All Contributors"><img src="https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square" /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
   <a href="https://github.com/kasrakhamesi/nestjs-sequelize-seeder-v2"><img src="https://img.shields.io/spiget/stars/1000?color=brightgreen&label=Star&logo=github" /></a>
   <a href="https://www.npmjs.com/nestjs-sequelize-seeder-v2" target="_blank">
   <img src="https://img.shields.io/npm/v/nestjs-sequelize-seeder-v2" alt="NPM Version" /></a>
   <a href="https://www.npmjs.com/nestjs-sequelize-seeder-v2" target="_blank">
   <img src="https://img.shields.io/npm/l/nestjs-sequelize-seeder-v2" alt="Package License" /></a>
   <a href="https://www.npmjs.com/nestjs-sequelize-seeder-v2" target="_blank">
   <img src="https://img.shields.io/npm/dm/nestjs-sequelize-seeder-v2" alt="NPM Downloads" /></a>
   <a href="https://github.com/kasrakhamesi/nestjs-sequelize-seeder-v2" target="_blank">
   <img src="https://s3.amazonaws.com/assets.coveralls.io/badges/coveralls_95.svg" alt="Coverage" /></a>
   <a href="https://github.com/kasrakhamesi/nestjs-sequelize-seeder-v2"><img src="https://img.shields.io/badge/Github%20Page-nestjs.sequelize.seeder-yellow?style=flat-square&logo=github" /></a>
   <a href="https://github.com/kasrakhamesi"><img src="https://img.shields.io/badge/Author-Kasra%20Khamesi-blueviolet?style=flat-square&logo=appveyor" /></a>
</p>

## 🌐 Description

Under the hood, nestjs-sequelize-seeder-v2 makes use of the [nest framework](https://nestjs.com/), and you also need to install [nestjs](https://nestjs.com/), and [sequelize](https://docs.nestjs.com/techniques/database#sequelize-integration) !

## 📦 Integration

To start using it, we first install the required dependencies. In this chapter we will demonstrate the use of the seeder for nestjs.

You simply need to install the package !

```ts
// We install with npm, but you could use the package manager you prefer !
npm install --save nestjs-sequelize-seeder-v2
```

## ▶️ Getting started

Once the installation process is complete, we can import the **SeederModule** into the root **AppModule**

```ts
import { Module } from '@nestjs/common';
import { SeederModule } from 'nestjs-sequelize-seeder-v2';

@Module({
   imports: [
      SeederModule.forRoot({
         // Activate this if you want to run the seeders if the table is empty in the database
         runOnlyIfTableIsEmpty: true,
      }),
   ],
})
export class AppModule {}
```

All options

```ts
SeederModule.forRoot({
   isGlobal: true,
   logging: true,
   disabled: false,
   runOnlyIfTableIsEmpty: false,
   connection: 'default',
   autoIdFieldName: 'id',
   disableEveryOne: false,
   enableAutoId: true,
   foreignDelay: 2000, // 2 seconds
});
```

The **forRoot()** method supports all the configuration properties exposed by the seeder constuctor . In addition, there are several extra configuration properties described below.

| name                  | Description                                                                                                                                                                                      | type      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| isGlobal              | If you want the module globally (**default: _true_** )                                                                                                                                           | _boolean_ |
| logging               | Option to display or not, the log of each creation (**default: _true_**)                                                                                                                         | _boolean_ |
| disabled              | This option allows you to disable the whole module, it is very useful for production mode (**default: _false_**)                                                                                 | _boolean_ |
| runOnlyIfTableIsEmpty | This option allows you to disable if the table is empty (**default: _false_**)                                                                                                                   | _boolean_ |
| connection            | This option is to add the name of the connection, this is very important if you use several connections to different databases (**default: _default_**)                                          | _string_  |
| autoIdFieldName       | This option is the id field, it works if the option `enableAutoId` is activated (**default: _id_**)                                                                                              | _string_  |
| enableAutoId          | This option adds the id automatically to each item, saving you the work, and solving some errors, the name of the id field is customized with the option `autoIdFieldName` (**default: _true_**) | _boolean_ |
| foreignDelay          | This option adds the timeout for tables that have relationships with other tables for each element, and this works if a seed has the `containsForeignKeys` option enabled                        | _number_  |

### Seeder

Sequelize implements the Active Record pattern. With this pattern, you use model classes directly to interact with the database. To continue the example, we need at least one seed. Let's define the User seed.

The decorator `Seeder` receives as parameter the unique values, this has to be added if you have in the table any column as unique !

> The following options will be applied individually to the seeders, and will be compared and operated with the global configuration

```ts
@Seeder({
   model: ModelUser,
   unique: ['name'], // You can add more !
   // Here you can also add the following options, but those options only work for this seeder !
   disabled: false,
   logging: true,
   runOnlyIfTableIsEmpty: false,
   connection: 'default',
   disableEveryOne: false,
   enableAutoId: true,

    // Enables this function if it uses a relationship management model (foreignKeys)
   containsForeignKeys: false,

   // This option add run time delay, if you still have errors just increase the delay time
   foreignDelay: 2000,
})

```

> `genSaltSync` and `hashSync` are imported from **bcryptjs**, you will have to install it independently !

```ts
import { Seeder, OnSeederInit } from 'nestjs-sequelize-seeder-v2';
import { ModelUser } from 'src/models/user';
import { genSaltSync, hashSync } from 'bcryptjs';

@Seeder({
   model: ModelUser,
   unique: ['name', 'username'],
})
export class SeedUser implements OnSeederInit {
   run() {
      const data = [
         {
            name: 'Admin',
            username: 'admin',
            age: 34,
            password: 'admin_password',
         },
         {
            name: 'Editor',
            username: 'editor',
            age: 25,
            password: 'editor_password',
         },
      ];
      return data;
   }

   // This function is optional!
   everyone(data) {
      // Encrypting the password for each user !
      if (data.password) {
         const salt = genSaltSync(10);
         data.password = hashSync(data.password, salt);
         data.salt = salt;
      }

      // Aggregated timestamps
      data.created_at = new Date().toISOString();
      data.updated_at = new Date().toISOString();

      return data;
   }
}
```

Next, let's look at the **UserModule:**

```ts
import { Module } from '@nestjs/common';
import { SeederModule } from 'nestjs-sequelize-seeder-v2';
import { SeedUser } from 'src/seeds/user.seed';

@Module({
   imports: [
      // Within an array!
      SeederModule.forFeature([SeedUser]),
   ],
})
export class UserModule {}
```

## 🎉 Associations, ForeignKeys

You were probably wondering how I handle seeders with associations, well I'm anxious to tell you that it's like this

-  First create three models
-  We'll make some connections
-  Creation of seeders for each model

```ts
@Table
export class Cat extends Model<Cat> {
   @PrimaryKey
   @AutoIncrement
   @Column
   id: number;

   @Column
   name: string;

   @BelongsToMany(() => Breed, () => CatBreed)
   breeds: Breed[];
}

@Table
export class Breed extends Model<Breed> {
   @PrimaryKey
   @AutoIncrement
   @Column
   id: number;

   @Column
   name: string;

   @BelongsToMany(() => Cat, () => CatBreed)
   Cats: Cat[];
}

@Table
export class CatBreed extends Model<CatBreed> {
   @ForeignKey(() => Cat)
   @Column
   cat_id: number;

   @ForeignKey(() => Breed)
   @Column
   breed_id: number;
}
```

And as a consequence we will create the sowers

```ts
@Seeder({
   model: Cat,
})
export class SeedCat implements OnSeederInit {
   run() {
      const data = [
         {
            name: 'First Cat',
         },
         {
            name: 'Second Cat',
         },
      ];
      return data;
   }
}
@Seeder({
   model: Breed,
})
export class SeedCatBreed implements OnSeederInit {
   run() {
      const data = [
         {
            name: 'First Breed',
         },
         {
            name: 'Second Breed',
         },
      ];
      return data;
   }
}
```

As you can see we already created the sembredores free of relations, but the next one has relations, therefore we have to activate the option `containsForeignKeys`, this works with `One-to-many`, `Many-to-many`, and `One-to-one`, if you get an error just increase the delay time in the `foreignDelay` option in the global configuration

```ts
@Seeder({
   model: CatBreed,
   containsForeignKeys: true,
})
export class SeedCatBreedUse implements OnSeederInit {
   run() {
      const data = [
         {
            cat_id: 1,
            breed_id: 2,
         },
         {
            cat_id: 1,
            breed_id: 1,
         },
         {
            cat_id: 2,
            breed_id: 1,
         },
         {
            cat_id: 2,
            breed_id: 2,
         },
      ];
      return data;
   }
}
```

## ⭐ Support for

`nestjs-sequelize-seeder-v2` is an open source project licensed by [MIT](LICENSE). You can grow thanks to the sponsors and the support of the amazing sponsors. If you want to join them, [contact me here](mailto:khamesikasra@gmail.com).

## 🎩 Stay in touch

-  Github [@kasrakhamesi](https://github.com/kasrakhamesi)

## 🚀 Contributors

Thanks to the wonderful people who collaborate with me !

## 📜 License

`nestjs-sequelize-seeder-v2` is [MIT licensed](LICENSE).

import { Injectable, Inject, Logger } from '@nestjs/common';
import { seeder_token } from './seed.constants';
import { Sequelize } from 'sequelize-typescript';
import { ModelCtor, Model } from 'sequelize/types';
import { SeederModuleOptions, More, SeederOptions } from '.';
import { __rest } from 'tslib';
import MergeDefault from 'merge-options-default';
import { isFunction, isBoolean, isNumber, isNull } from 'is-all-utils';

@Injectable()
export class SeederService {
   private model: ModelCtor<Model<any, any>>;
   private con: Sequelize;
   private seed: any;
   private seedData: Partial<SeederOptions & { seedName?: string }>;
   public log: Logger;
   private data: any;
   constructor(
      @Inject(seeder_token.options)
      public options: Partial<
         SeederModuleOptions & { containsForeignKeys?: boolean }
      >,
   ) {
      this.log = new Logger('SequelizeSeeder', { timestamp:true });
   }

   /**
    * @author Kasra Khamesi <khamesikasra@gmail.com>
    * @description This is the main method to create a seed!
    * @param connection Sequelize
    * @param seed Object | Function
    * @param seedData More
    */
   async onSeedInit(connection: Sequelize, seed: any, seedData: More) {
      /**
       * @author Kasra Khamesi <khamesikasra@gmail.com>
       * @description Merge seedData with options for some options
       */
      const newSeedData: SeederModuleOptions = __rest(seedData, [
         'modelName',
         'unique',
         'seedName',
      ]);

      this.options = MergeDefault<SeederModuleOptions>(
         this.options,
         newSeedData,
      );

      if (this.options.disabled) {
         return;
      }

      // Setting all objects
      this.con = connection;
      this.model = this.con.models[seedData.modelName];

      if (!this.model) {
         return this.log.error(`😢 ${seedData.modelName} not Found !`);
      }

      /**
       * @author Kasra Khamesi <khamesikasra@gmail.com>
       * @description Execute this if property `runOnlyIfTableIsEmpty` is true
       */
      if (this.options.runOnlyIfTableIsEmpty) {
         if (await this.verifyIfTableIsEmpty()) return;
      }

      // For add unique field if autid is enabled
      if (this.options.enableAutoId) {
         seedData.unique = [this.options.autoIdFieldName].concat(
            seedData?.unique,
         );
      }

      // Installing functions individually !
      this.seed = new seed(this.options);
      this.data = this.seed.run();
      this.seedData = seedData as any;

      // Called all the cracks
      await this.initialized();
   }

   /**
    * @author Kasra Khamesi <khamesikasra@gmail.com>
    * @description Check if the object exists !
    * @param where More
    */
   private async isUnique(where: More): Promise<boolean> {
      try {
         if (where[1] == undefined) return false
         const data = await this.model.findOne({ where });
         if (data) return true;
         return false;
      } catch (err) {
         throw new Error(`[💥 SequelizeSeeder] ${err?.original?.sqlMessage}`);
      }
   }

   /**
    * @author Kasra Khamesi <khamesikasra@gmail.com>
    * @description Check if the table is empty
    */
   private async verifyIfTableIsEmpty(): Promise<boolean> {
      try {
         const data = await this.model.count();
         if (data > 0) return true;
         return false;
      } catch (err) {
         throw new Error(`[💥 SequelizeSeeder] ${err?.original?.sqlMessage}`);
      }
   }

   /**
    * @author Kasra Khamesi <khamesikasra@gmail.com>
    * @description Create the object if it does not exist, and display a success message !
    * @param item More
    */
   private async createItem(
      item: More | any,
      { autoId, index }: More,
   ): Promise<void> {
      const { disableEveryOne, enableAutoId, autoIdFieldName } = this.options;

      // For add an id automaticly
      if (isBoolean(enableAutoId) && enableAutoId && isNumber(autoId)) {
         item[autoIdFieldName] = autoId;
      }

      // Called everyone function if exist !
      if (!disableEveryOne && isFunction(this.seed?.everyone)) {
         item = this.seed.everyone(item, index);
      }

      if (this.options.containsForeignKeys) {
         const time = setTimeout(async () => {
            await this.createItem(item, { autoId, index });
            this.options.containsForeignKeys = false;
            clearTimeout(time);
         }, this.options.foreignDelay);
         return;
      }

      try {
         this.model.create(item).then(() => {
            this.options.logging &&
               this.log.log(
                  `🎉 Created correctly, '${this?.seedData?.seedName}' :${index} !`,
               );
         });
      } catch (err) {
         throw new Error(`[💥 SequelizeSeeder] ${err?.original?.sqlMessage}`);
      }
   }

   /**
    * @author Kasra Khamesi <khamesikasra@gmail.com>
    * @description This function executes all the creation and alteration code of all the objects !
    */
   private async initialized(): Promise<void> {
      const { logging, enableAutoId, autoIdFieldName } = this.options;
      const uniques = this.seedData?.unique || [];
      const hasUniques = uniques.length > 0;
      const isLog = logging;

      let autoId = 0;

      for (let [index, item] of Object.entries<any>(this.data)) {
         let alreadyItem = null;
         index = Number(index) as any;

         if (hasUniques) {
            let uniqueData = {};
            for (const unique of uniques) {
               if (item[unique]) {
                  uniqueData[unique] = item[unique];
               } else {
                  if (!(enableAutoId && unique === autoIdFieldName)) {
                     this.log.warn(
                        `❓ Undefined value for '${unique}' in object ${index} ${this.seedData?.seedName}`,
                     );
                  }
               }
            }

            alreadyItem = await this.isUnique(uniqueData);

            if (alreadyItem === false) {
               ++autoId;
               await this.createItem(item, {
                  autoId,
                  index,
               });
            } else {
               isLog &&
                  this.log.verbose(
                     `😲 Already exists in ${this.seedData?.seedName} the :${index} item`,
                  );
            }
         } else {
            ++autoId;
            await this.createItem(item, {
               autoId,
               index,
            });
         }
      }
   }
}

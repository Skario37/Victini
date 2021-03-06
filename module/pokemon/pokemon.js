const Pokemon = require('./classes/ClassPokemon.js');

const stc = require('string-to-color');

const DISCORD = require('discord.js');

const read = require('./services/read.js');

module.exports = (client) => {
    client.pokemon.generatePokemon = async (
      client, 
      // Attr : _id[number], origin_trainer[struct], level[number], 
      // iv[number], isStarter[boolean], origin[struct], isEgg[boolean], 
      // isShinyLock[boolean], isShiny[boolean], form[number], hasHiddenAbility[boolean], 
      // gender[string], happiness[number], moves[array], item[struct], variety[number]
      struct = {}
    ) => {
      // Create new pokemon
      const pokemon = new Pokemon({
        "id": struct._id, 
        "uuid": client.getUUID(), 
        "createdDate": new Date()
      });

      // Get the pokemon species
      const pokemonSpecies = read.getPokemonByID(client, struct._id);

      // Get the pokemon variety
      if (!struct.variety) struct.variety = 0;
      const pokemonVariety = read.getPokemonVarietyByID(client, struct._id, struct.variety);

      // Is Pokemon egg
      if ( struct.isEgg ) {
        pokemon.setEgg(true);
        pokemon.setHatchCounter(pokemonSpecies.hatch_counter * 255);
      } else pokemon.setNames(pokemonSpecies.names);

      // Set Nicknames
      // Do not need

      // Set PID
      // Do not need while it's generated itself

      // Set Color
      pokemon.setColor(pokemonSpecies.color);

      // Set gender
      if ( struct.gender ) { 
        pokemon.setGender(struct.gender);
      } else {
        if ( !pokemonSpecies.gender_rate === -1 ) {
          pokemon.setGender(3);
        } else {
          if ( client.percent( pokemonSpecies.gender_rate, 8 )) { 
            pokemon.setGender(1);
          } else { 
            pokemon.setGender(2); 
          }
        }
      }


      // Is Pokemon Shinyyyyyyy ?
      if ( struct.isShinyLock ) pokemon.setShiny(false);
      else {
        // We need to know if it's undefined
        if ( typeof struct.isShiny !== "undefined" ) {
          switch ( struct.isShiny ) {
            case true: case "true": 
              pokemon.setShiny(true); 
              break;
            default: 
              pokemon.setShiny(false);
          }
        } else {
          const server = await client.database.db_server.request.getDocument(client, "server");
          const kitty = await client.database.db_server.request.getDocument(client, "kitty");
          var binTID = client.bin( server.trainer_id, 16 );
          var binSID = client.bin( server.secret_id, 16 );
          var binPID; 
          var result; 
          var n = 1;
          
          if ( kitty.reward[0].is_unlocked ) n += 2;
          for ( var i = 0; i < n; i++ ) {
            var pidForBinPID = client.generatePID(client, 32);
            binPID = client.bin( pidForBinPID, 32 );

            var binPIDA = binPID.substr(0,16);
            var binPIDB = binPID.substr(16);

            result = parseInt(binPIDA, 2) ^ parseInt(binPIDB, 2) ^ parseInt(binTID, 2) ^ parseInt(binSID, 2);

            if ( result < 16 ) { 
              pokemon.setShiny(true); 
              break; 
            } else pokemon.setShiny(false);
          }
        }
      }

      
      // Set ball
      // Set starter
      if ( struct.isStarter ) {
        pokemon.setStarter(true);
        pokemon.setBall(12);
      } else pokemon.setStarter(false);


      // Set happiness
      if ( struct.happiness ) pokemon.setHappiness(struct.happiness);
      else pokemon.setHappiness(pokemonSpecies.base_happiness);
    

      // Set Origin Trainer
      if ( struct.origin_trainer ) pokemon.setOriginTrainer(struct.origin_trainer);


      // Set Pokemon varieties
      pokemon.setVarieties(pokemonSpecies.varieties);
      const hcoef = Number(client.getRandomArbitrary(0.7, 1.3).toFixed(2));
      const wcoef = Number(client.getRandomArbitrary(0.7, 1.3).toFixed(2));
      const height = Number((pokemonVariety.height * hcoef).toFixed(2));
      const weight = Number((pokemonVariety.weight * wcoef).toFixed(2));
      pokemon.setCurrentVariety({
        "base_experience": pokemonVariety.base_experience,
        "is_default": pokemonVariety.is_default,
        // Set Height and Weight
        "height_coef": hcoef,
        "weight_coef": wcoef,
        "height": height,
        "weight": weight,
        // Set sprites and icons
        "sprites": pokemonVariety.sprites,
        "icons": pokemonVariety.icons,
        "stats": pokemonVariety.stats,
        "types": pokemonVariety.types
      });


      // Set Pokemon forms and current form
      pokemon.setForms(pokemonVariety.forms);
      const { formStartIndex, formEndIndex } = getFormRange(struct._id, struct.variety);
      if ( struct.form ) {
        if ( struct.form >= formStartIndex && struct.form <= formEndIndex ) {
          pokemon.setCurrentForm(read.getPokemonFormByID(client, struct._id, struct.form)); 
        } else {
          let rand = client.getRandomInt( formStartIndex, formEndIndex );
          pokemon.setCurrentForm(read.getPokemonFormByID(client, struct._id, rand));
        }
      } else { 
        let rand = client.getRandomInt( formStartIndex, formEndIndex );
        pokemon.setCurrentForm(read.getPokemonFormByID(client, struct._id, rand)); 
      }

      
      // Set ability
      let ability = {};
      let abilities = {};
      if(struct.hasHiddenAbility) { // HAVE his hidden ability
        ability = pokemonVariety.abilities.filter(ability => {
          return ability.is_hidden === true;
        });
      } else {
        if(typeof struct.hasHiddenAbility !== "undefined") { // DONT HAVE his hidden ability
          abilities = pokemonVariety.abilities.filter(ability => {
            return ability.is_hidden === false;
          });
          let rand = client.getRandomInt(0, abilities.length - 1); 
          ability = abilities[rand];
        } else { // CAN HAVE his hidden ability
          if( client.percent( 90, 100 ) ) { // Dont have 
            abilities = pokemonVariety.abilities.filter(ability => {
              return ability.is_hidden === false;
            });
            let rand = client.getRandomInt(0, abilities.length - 1);
            ability = abilities[rand];
          } else { // have
            ability = pokemonVariety.abilities.filter(ability => {
              return ability.is_hidden === true;
            });
          }
        }
      }
      pokemon.setAbility(ability);


      // Set Nature
      const naturesLength = read.getNaturesLength(); 
      if(struct.nature) {
        pokemon.setNature(read.getNatureByID(client, struct.nature));
      } else {
        let rand = client.getRandomInt(1, naturesLength - 1); // Nature index start at 1
        pokemon.setNature(read.getNatureByID(client, rand))
      }

      
      // Set experience
      const growth = read.getGrowthByURL(pokemonSpecies.growth_rate.url);
      const experience = {};
      let level = 1;
      if(struct.level) {
        experience.level = struct.level;
      } else {
        let rand = client.getRandomIntInclusive(-8, 4);
        level = 100 - Math.floor( Math.pow( pokemonSpecies.capture_rate + 125, 0.76 ) );
        level += rand;
        experience.level = level;
      }
      let maxEXP = Math.max.apply( Math, growth.levels.map( level => { return level.experience; } ) );
      experience.points = client.pokemon.levelSystem.calcEXP( experience.level, maxEXP );
      experience.obtained_level = experience.level;
      pokemon.setExperience(experience);


      // Set Stats
      const stats = pokemonVariety.stats;
      stats.forEach((stat, index) => {
        let maxStat = false;
        if(struct.iv) {
          if(client.getRandomIntInclusive(0, 1) === 1 || struct.iv === pokemonVariety.stats.length - index) {
            maxStat = true;
            struct.iv -= 1;
          }
        }
        if(maxStat) stat.internal_value = 31; 
        else stat.internal_value = client.getRandomIntInclusive(1, 31);
        stat.effort_value = 0; // By default
        stat.real_value = client.pokemon.stats.calcStat(stat.stat.name, level, stat.internal_value, stat.effort_value, stat.base_stat, pokemon.getNature())
        stat.current_value = stat.real_value; // Is the same at generation
        stats[index] = stat;
      });
      pokemon.setStats(stats);


      // Set Moves
      const moves = [];
      if(struct.moves) {
        for (let index = 0; index < struct.moves.length; index++) {
          const move = read.getMoveByID(client, struct.moves[index]);
          const m = {
            "name": move.name,
            "url": read.getMoveUrlByID(client, struct.moves[index])
          }
          moves.push(m);
        }
      } else {
        const filtered_moves = pokemonVariety.moves.filter(move => {
          return ( move.version_group_details[0].level_learned_at <= experience.level && ( move.version_group_details[0].move_learn_method.name === "egg" || move.version_group_details[0].move_learn_method.name === "level-up" ) );
        });
        if(filtered_moves.length > 4) { 
          for(let i = 0; i < 4; i++) { 
            let m = filtered_moves.splice( client.getRandomInt( 0, filtered_moves.length ), 1 )[0];
            moves.push( m.move ); 
          } 
        }
        else {
          for (let i = 0; i < filtered_moves.length; i++) { 
            moves.push( filtered_moves[i].move ); 
          } 
        }
      }
      pokemon.setMoves(moves);


      // Set Item
      let item = {};
      if(struct.item) { 
        const it = read.getItemByID(client, struct.item);
        item = {
          "name": it.name,
          "url" : read.getItemUrlByID(client, struct.item),
          "is_held": true,
          "is_used": false
        }
      } else {
        for (let i = 0; i < pokemonVariety.held_items.length; i++ ) {
          if ( client.percent( 100 / pokemonVariety.held_items.length, 100 ) && !pokemon.isStarter ) {
            item = pokemonVariety.held_items[i].item;
            item.is_held = true;
            item.is_used = false
            break;
          } else {
            item = null;
          }
        }
      }
      pokemon.setItem(item);


      // Set Encountered Location
      if(struct.encountered_location) {
        pokemon.setEncounteredLocation(struct.encountered_location);
      } else {
        pokemon.setEncounteredLocation();
      }

      return pokemon;
    };


    client.pokemon.displayPokemon = async ( client, message, pokemon, index = '') => {
      const settings = client.getSettings(message.guild);
      // Overrides pokemon if instance of Pokemon
      if(!(pokemon instanceof Pokemon)) pokemon = new Pokemon(pokemon);

      const embed = new DISCORD.MessageEmbed();
      embed.setColor(stc(pokemon.getColor().name));

      
      // Title
      let title = '';
      if(pokemon.getShiny())            { title += `${client.pokemon.emoji.shiny}`; }
      if(pokemon.getStarter())          { title += `${index} `; }
      if(pokemon.getOriginTrainer())    { title += `(${pokemon.getOriginTrainer().name}) `; }
      if(pokemon.getNickname() !== '')  { title += `**${pokemon.getNickname()}** `; }
      else                              { title += `**${pokemon.getNames().find(name => name.language.name === settings.serverLanguage.toLowerCase()).name}** `; }
      title += `${client.pokemon.emoji.gender[pokemon.getGender()]}`;

      switch ( settings.serverLanguage.toLowerCase() ) {
        case "en":
          title += `*lvl:* **${pokemon.getExperience().level}**`;
          break;
        case "fr":
        default:
          title += `*niv:* **${pokemon.getExperience().level}**`;
      }

      embed.setTitle( title );

      //Construct HP's
      if ( !pokemon.getStarter() ) {
        let statHP = pokemon.getStats().find(stat => stat.stat.name === "hp");
        let percentHP = Math.floor(statHP.current_value / statHP.real_value * 100);
        var gauge = '';
        for( var i = 0; i<=20; i++ ) {
          if ( i <= percentHP / 5 ) gauge += "l";
          else gauge += " ";
        }
        embed.setDescription(`[${gauge}] ${percentHP}%`);
      }

      // Construct Type
      const pokemonTypes = pokemon.getCurrentVariety().types;
      let type = "Type";
      let t1 = pokemonTypes.find( type => type.slot === 1 ).type.name;
      let t2 = pokemonTypes.find( type => type.slot === 2 ); 
      if(typeof t2 !== "undefined") {
        t2 = t2.type.name; 
        type = "Types";
      } else {
        t2 = '';
      }
      embed.addField( type, `${client.pokemon.emoji.type[t1]} ${client.pokemon.emoji.type[t2]}`);


      // Construct Sprites
      let sprites = pokemon.getCurrentForm().sprites;
      let image = sprites.default;
      if(pokemon.getGender() === "1") {
        if(pokemon.isShiny) { 
          if(sprites.femaleShiny) image = sprites.femaleShiny;
        } else if(sprites.female) image = sprites.female;
      } else if(pokemon.isShiny)  image = sprites.defaultShiny;

      const attachment = new DISCORD.MessageAttachment(read.getSpriteByUrl(image) , "image.png");
      embed.attachFiles(attachment);
      embed.setThumbnail("attachment://image.png");
    
      return await message.channel.send( embed );
    };

    client.pokemon.capture = async ( client, message, pokemon ) => {
      const settings = client.getSettings(message.guild);
      // Overrides pokemon if instance of Pokemon
      if(!(pokemon instanceof Pokemon)) pokemon = new Pokemon(pokemon);
      const team = await client.database.db_trainer.request.getTeam(client, message.member);
      let pc = null;
      if(team.length < 6) {
        await client.database.db_trainer.request.addPokemonToTeam(client, message.member, pokemon);
      } else {
        pc = await client.database.db_trainer.request.getPC(client, message.member);
        for (let index = 0; index < pc.length; index++) {
          if (pc[index].length < 30) {
            await client.database.db_trainer.request.setBoxToPC(client, message.member, pc[index].push(pokemon), index);
            break;
          } 
        }
      }
      
      let name = pokemon.names.filter(name => name.language.name === settings.serverLanguage.toLowerCase());
      let text = '';
      switch ( settings.serverLanguage.toLowerCase() ) {
        case "en": 
          text = `You got **${name[0].name}**!`
          if(pc) text += " And was moved into your box because your team is full.";
        case "fr":
        default:
          text = `Vous avez obtenu **${name[0].name}** !`;
          if(pc) text += " Et a été placé dans ta boite car ton équipe est pleine.";
      }
   
        return message.reply(text);
    }

    const getFormRange = (pokemonID, varietyID) => {
      let formStartIndex = 0;
        let formEndIndex = 0;
        let lastLength = 0;
        for (let i = 0; i < varietyID; i++) {
          let pv = read.getPokemonVarietyByID(pokemonID, varietyID);
          if (i == 1) lastLength -= 1; // Because of index start at 0
          formStartIndex += lastLength;
          formEndIndex += pv.forms.length;
          lastLength = pv.forms.length;
        }
        if (formEndIndex > 0) formEndIndex -= 1; // Because index start at 0
        return {
          "formStartIndex": formStartIndex,
          "formEndIndex": formEndIndex
        }
    };
};
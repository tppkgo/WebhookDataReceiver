const Discord=require('discord.js');
const moves=require('../static/moves.json');

//####################################################//
//####################################################//
//#####   _____            _____ _____   _____   #####//
//#####  |  __ \     /\   |_   _|  __ \ / ____|  #####//
//#####  | |__) |   /  \    | | | |  | | (___    #####//
//#####  |  _  /   / /\ \   | | | |  | |\___ \   #####//
//#####  | | \ \  / ____ \ _| |_| |__| |____) |  #####//
//#####  |_|  \_\/_/    \_\_____|_____/|_____/   #####//
//#####     RAID WEBHOOKS, AND SUBSCRIPTIONS     #####//
//####################################################//
//####################################################//

module.exports.run = async (MAIN, raid, city) => {
  if(MAIN.debug.raids=='ENABLED'){ if(MAIN.debug.detailed=='ENABLED'){ console.info(raid); } else{ console.info(raid.gym_id); } }
  let defendingTeam='', raidUrl='', area, subArea='', raidEmbed='', type='', raidSponsored='',
  timeNow=new Date().getTime(), hatchTime=MAIN.Bot_Time(raid.start,'1'), endTime=MAIN.Bot_Time(raid.end,'1'),
  hatchMinutes=Math.floor((raid.start-(timeNow/1000))/60), endMinutes=Math.floor((raid.end-(timeNow/1000))/60);
  // DETERMINE THE GEOFENCE AREA
  let raidArea=MAIN.Get_Area(raid.latitude,raid.longitude);
  if(!raidArea){ raidArea='None'; console.error('NO RAID AREA',raid); }
  // DETERMINE GYM CONTROL
  switch(raid.team_id){
    case 1: defendingTeam=MAIN.emotes.teams.mystic+' Gym'; break;
    case 2: defendingTeam=MAIN.emotes.teams.valor+' Gym'; break;
    case 3: defendingTeam=MAIN.emotes.teams.instinct+' Gym'; break;
    default: defendingTeam='Uncontested Gym';
  }
  if(raid.sponsor_id==true){ raidSponsored=' | '+MAIN.emotes.ex_pass+' Eligible'; }
  if(!raid.gym_name){ gymName='No Name'; }
  else{ gymName=raid.gym_name; }
  // DETERMINE IF IT'S AN EGG OR A RAID
  switch(raid.cp){
    case 0:
      if(MAIN.logging=='ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] Sent a level '+raid.level+' Egg for '+city.name+'.'); }
      raidEmbed=new Discord.RichEmbed().setThumbnail(raid.url)
        .addField(raid.gym_name, raidArea.name, false)
        .addField('Hatches: '+hatchTime+' (*'+hatchMinutes+' Mins*)', 'Level '+raid.level+' | '+defendingTeam+raidSponsored, false)
        .addField('Directions:','[Google Maps](https://www.google.com/maps?q='+raid.latitude+','+raid.longitude+') | [Apple Maps](http://maps.apple.com/maps?daddr='+raid.latitude+','+raid.longitude+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+raid.latitude+','+raid.longitude+'&navigate=yes)',false);
      type='eggs'; break;
    default:
      if(MAIN.logging=='ENABLED'){ console.info('[Pokébot] ['+MAIN.Bot_Time(null,'stamp')+'] Sent a level '+raid.level+' Raid for '+city.name+'.'); }
      raidUrl=MAIN.Get_Sprite(raid.form, raid.pokemon_id); type='raids';
      if(!moves[raid.move_1].name){ console.error('Move ID #'+raid.move_1+' not found in pokemon.json'); }
      if(!moves[raid.move_2].name){ console.error('Move ID #'+raid.move_2+' not found in pokemon.json'); }
      raidEmbed=new Discord.RichEmbed().setThumbnail(raidUrl)
        .addField('**'+MAIN.pokemon[raid.pokemon_id]+'** has taken over a Gym!', moves[raid.move_1].name+'/'+moves[raid.move_2].name, false)
        .addField(gymName, raidArea.name, false)
        .addField('Raid Ends: '+endTime+' (*'+endMinutes+' Mins*)', 'Level '+raid.level+' | '+defendingTeam+raidSponsored, false)
        .addField('Directions:','[Google Maps](https://www.google.com/maps?q='+raid.latitude+','+raid.longitude+') | [Apple Maps](http://maps.apple.com/maps?daddr='+raid.latitude+','+raid.longitude+'&z=10&t=s&dirflg=w) | [Waze](https://waze.com/ul?ll='+raid.latitude+','+raid.longitude+'&navigate=yes)',false);
  }
  // SEND RAID POST BASED ON LEVEL
  if(MAIN.rConfig.Discord_Feeds=='ENABLED'){
    switch(raid.level){
      case 1:
      case 2:
        raidEmbed.setColor('f358fb');
        if(MAIN.feed[city.name][type].pink){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].pink); }
        if(raid.sponsor_id==true && MAIN.feed[city.name][type].ex_eligible){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].ex_eligible); } break;
      case 3:
      case 4:
        raidEmbed.setColor('ffd300');
        if(MAIN.feed[city.name][type].gold){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].gold); }
        if(raid.sponsor_id==true && MAIN.feed[city.name][type].ex_eligible){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].ex_eligible); } break;
      case 5:
        raidEmbed.setColor('5b00de');
        if(MAIN.feed[city.name][type].free){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].free); }
        if(MAIN.feed[city.name][type].legendary){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].legendary); }
        if(raid.sponsor_id==true && MAIN.feed[city.name][type].ex_eligible){ MAIN.Send_Embed(raidEmbed,MAIN.feed[city.name][type].ex_eligible); } break;
    }
  }

  if(MAIN.rConfig.Subscriptions=='ENABLED'){

  }

  // END
  return;
}

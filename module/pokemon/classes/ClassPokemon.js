// POKEMON CLASS
class Pokemon {
    constructor(id, uuid, pid, createdDate) {
        this._id = id;
        this.uuid = uuid;
        this.created_date = createdDate;
        // Set to default undetermined values
        this.setNames();
        this.setNicknames();
        this.generatePID(32);

        this.setGender();
        this.setShiny();
        this.setBall();

        this.setHappiness();
        this.setOriginTrainer();
        this.setStarter();
        this.setEgg();
        this.setHatchCounter();
        
        this.setVarieties();
        this.setCurrentVariety();
        this.setForms();
        this.setCurrentForm();
        this.setAbility();
        this.setNature();

        this.setExperience();
        this.setStats();
        this.setItem();
    }

    setNames        (names = "?????")   { this.names = names; }
    getNames        ()                  { return this.names; }
    setNickname     (nickname = '')     { this.nickname = nickname; }
    getNickname     ()                  { return this.nickname; }
    setPID          (pid = 0)           { this.pid = pid; }
    getPID          ()                  { return this.pid; }
    
    setHeight       (height = -1)       { this.height = height; }
    getHeight       ()                  { return this.height; }
    setHeightCoef   (heightCoef = 1)    { this.height_coef = heightCoef; }
    getHeighCoef    ()                  { return this.height_coef; }
    setGender       (gender = 3)        { this.gender = gender; }
    getGender       ()                  { return this.gender; }
    setShiny        (shiny = false)     { this.shiny = shiny; }
    getShiny        ()                  { return this.shiny; }
    setBall         (ball = null)       { this.ball = ball; }
    getBall         ()                  { return this.ball; }

    setHappiness        (happiness = 50)            { this.happiness = happiness; }
    getHappiness        ()                          { return this.happiness; }
    setOriginTrainer    (originTrainer = "?????")   { this.origin_trainer = originTrainer; }
    getOriginTrainer    ()                          { return this.origin_trainer; }
    setStarter          (starter = false)           { this.starter = starter; }
    getStarter          ()                          { return this.starter; }
    setEgg              (egg = false)               { this.egg = egg; }
    getEgg              ()                          { return this.egg; }
    setHatchCounter     (counter = 0)               { this.hatch_counter = counter; }
    getHatchCounter     ()                          { return this.hatch_counter; }
    
    setVarieties        (varieties = null)        { this.varieties = varieties; }
    getVarieties        ()                        { return this.varieties; }
    setCurrentVariety   (variety = null)          { this.current_variety = variety; }
    getCurrentvariety   ()                        { return this.current_variety; }
    setForms            (forms = null)            { this.forms = forms; }
    getForms            ()                        { return this.forms; }
    setCurrentForm      (form = null)             { this.current_form = form; }
    getCurrentForm      ()                        { return this.current_form; }
    setAbility          (ability = null)          { this.ability = ability; }
    getAbility          ()                        { return this.ability; }
    setNature           (nature = null)           { this.nature = nature; }
    getNature           ()                        { return this.nature; }

    setExperience       (experience = null)       { this.experience = experience; }
    getExperience       ()                        { return this.experience; }
    
    setStats            (stats = null)            { this.stats = stats; }
    getStats            ()                        { return this.stats; }

    setMoves            (moves = null)            { this.moves = moves; }
    getMoves            ()                        { return this.moves; }

    setItem             (item = null)             { this.item = item; }
    getItem             ()                        { return this.item; }

    setEncounteredLocation  (location = "?????")  { this.encountered_location = location; }
    getEncounteredLocation  ()                    { return this.encountered_location; }

    generatePID(bits) {
      let min = 0;
      let max = Math.floor(Math.pow(2, bits));
      let pid = Math.floor(Math.random() * (max - min)) + min;
      this.setPID(pid);
    }
}

module.exports = Pokemon;
class Weapon {
  constructor(name, attack, durability, range) {
    this.name = name;
    this.attack = attack;
    this.durability = durability;
    this.range = range;
  }

  takeDamage(damage) {
    this.durability -= damage;
    if (this.durability < 0) this.durability = 0;
  }

  getDamage() {
    return this.durability > 0 ? this.attack : Math.round(this.attack * 0.2);
  }

  isBroken() {
    return this.durability === 0;
  }
}

class EnhancedWeapon extends Weapon {
  constructor(baseWeapon) {
    super(
      `Улучшенный ${baseWeapon.name}`,
      baseWeapon.attack + 10,
      baseWeapon.durability + 200,
      baseWeapon.range
    );
  }
}

class Player {
  constructor(name, life, magic, speed, attack, agility, luck, description, weapon) {
    this.name = name;
    this.life = life;
    this.magic = magic;
    this.speed = speed;
    this.attack = attack;
    this.agility = agility;
    this.luck = luck;
    this.description = description;
    this.weapon = weapon;
    this.position = 0;
  }

  getDamage() {
    return this.weapon ? this.weapon.getDamage() : Math.round(this.attack * 0.2);
  }

  takeDamage(damage) {
    this.life -= damage;
    if (this.life < 0) this.life = 0;
  }

  isDead() {
    return this.life === 0;
  }

  isAttackBlocked(opponent) {
    return Math.random() < opponent.agility / 100;
  }

  dodged(opponent) {
    return Math.random() < this.luck / 100;
  }

  takeAttack(opponent) {
    if (this.dodged(opponent)) return 'уклонение';
    if (this.isAttackBlocked(opponent)) return 'блок';
    const damage = opponent.getDamage();
    this.takeDamage(damage);
    if (this.weapon && !this.weapon.isBroken()) {
      this.weapon.takeDamage(damage); // Уменьшаем прочность оружия при атаке
    }
    return damage;
  }

  chooseEnemy(players) {
    const enemies = players.filter(player => player !== this && !player.isDead());
    return enemies[Math.floor(Math.random() * enemies.length)];
  }

  moveLeft() {
    this.position -= 1;
  }

  moveRight() {
    this.position += 1;
  }

  move(direction) {
    if (direction === 'left') {
      this.moveLeft();
    } else if (direction === 'right') {
      this.moveRight();
    }
  }

  checkWeapon() {
    return this.weapon && !this.weapon.isBroken();
  }

  tryAttack(opponent) {
    if (this.checkWeapon()) {
      const damage = this.getDamage();
      opponent.takeDamage(damage);
      if (this.weapon) {
        this.weapon.takeDamage(damage); // Уменьшаем прочность оружия после атаки
      }
      return `Атака нанесла ${damage} урона`;
    } else {
      return "Оружие сломано!";
    }
  }

  moveToEnemy(enemy) {
    while (this.position !== enemy.position) {
      if (this.position < enemy.position) {
        this.move('right');
      } else {
        this.move('left');
      }
    }
  }
}

class EnhancedPlayer extends Player {
  constructor(basePlayer) {
    super(
      basePlayer.name,
      basePlayer.life + 30,
      basePlayer.magic + 20,
      basePlayer.speed + 10,
      basePlayer.attack + 10,
      basePlayer.agility + 5,
      basePlayer.luck + 5,
      `На пике своих сил: ${basePlayer.description}`,
      basePlayer.weapon
    );
  }
}

const baseWeapons = [
  new Weapon('Меч', 25, 500, 1),
  new Weapon('Лук', 15, 300, 3),
  new Weapon('Посох', 20, 400, 2),
  new Weapon('Кинжал', 18, 350, 1)
];

function generatePlayer(name, description, weaponIndex) {
  const weapon = Math.random() < 0.2 ? new EnhancedWeapon(baseWeapons[weaponIndex]) : baseWeapons[weaponIndex];
  const basePlayer = new Player(
    name,
    100 + Math.floor(Math.random() * 20),
    30 + Math.floor(Math.random() * 30),
    20 + Math.floor(Math.random() * 10),
    25 + Math.floor(Math.random() * 10),
    10 + Math.floor(Math.random() * 10),
    15 + Math.floor(Math.random() * 10),
    description,
    weapon
  );
  return Math.random() < 0.2 ? new EnhancedPlayer(basePlayer) : basePlayer;
}

const players = [
  generatePlayer('Ле\'Гард', 'Могучий воин', 0),
  generatePlayer('Рагнвальдр', 'Суровый варвар', 1),
  generatePlayer('Энки', 'Мудрый маг', 2),
  generatePlayer('Кахара', 'Хитрый разбойник', 3)
];

const log = [];
const playTurnButton = document.getElementById('play-turn');
const winnerContainer = document.getElementById('winner');
const playersContainer = document.getElementById('players');
const logContainer = document.getElementById('log');

function updateUI() {
  playersContainer.innerHTML = '';
  players.forEach(player => {
    const playerDiv = document.createElement('div');
    playerDiv.className = `player ${player.isDead() ? 'dead' : ''}`;
    playerDiv.innerHTML = `
      <strong>${player.name}</strong>
      <p>${player.description}</p>
      <p>Здоровье: ${player.life}</p>
      <p>Магия: ${player.magic}</p>
      <p>Ловкость: ${player.agility}</p>
      <p>Удача: ${player.luck}</p>
      <p>Атака: ${player.attack}</p>
      <p>Оружие: ${player.weapon ? player.weapon.name : 'Без оружия'}</p>
      <p>Прочность оружия: ${player.weapon ? player.weapon.durability : 'Нет'}</p>
    `;
    playersContainer.appendChild(playerDiv);
  });

  logContainer.innerHTML = log.map(entry => `<p>${entry}</p>`).join('');
}

function turn(players) {
  players.sort((a, b) => b.speed - a.speed); // Игроки действуют по порядку скорости
  
  players.forEach(player => {
    if (player.isDead()) return; // Пропускаем мертвых игроков
    const enemy = player.chooseEnemy(players);
    player.moveToEnemy(enemy); // Двигаемся к врагу
    const result = player.tryAttack(enemy); // Пытаемся атаковать
    log.push(`${player.name} атакует ${enemy.name}: ${result}`);
  });
  
  updateUI();
}

function play(players) {
  const alivePlayers = players.filter(player => !player.isDead());
  
  if (alivePlayers.length === 1) {
    // Победитель найден
    winnerContainer.textContent = `Победитель: ${alivePlayers[0].name}`;
    winnerContainer.classList.remove('hidden');
    playTurnButton.disabled = true;
  } else if (alivePlayers.length > 1) {
    // Продолжаем игру
    turn(players);
  }
}

playTurnButton.addEventListener('click', () => {
  play(players); // Запускаем ход игры
});

updateUI();

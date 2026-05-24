const PLANET_DATA = [
  {
    id: 'sun',
    name: 'Солнце',
    color: '#FFD700',
    orbitRadius: 0,
    size: 40,
    imgPath: 'public/solar/solar.png',
    info: {
      orbital: [
        { label: 'Тип', value: 'Жёлтый карлик' },
        { label: 'Спектральный класс', value: 'G2V' },
        { label: 'Расстояние от центра Галактики', value: '~26 000 св. лет' },
      ],
      physical: [
        { label: 'Масса', value: '1.989 × 10³⁰ кг' },
        { label: 'Диаметр', value: '1 391 000 км' },
        { label: 'Гравитация (поверхность)', value: '274 м/с²' },
        { label: 'Плотность', value: '1.41 г/см³' },
      ],
      temperature: [
        { label: 'Поверхность', value: '5 500°C' },
        { label: 'Ядро', value: '~15 000 000°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'H (73%), He (25%)' },
      ],
    },
  },
  {
    id: 'mercury',
    name: 'Меркурий',
    color: '#b5b5b5',
    orbitRadius: 70,
    size: 10,
    orbitalPeriod: 0.24,
    imgPath: 'public/mercury/mercury1.png',
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '87.97 дней (0.24 года)' },
        { label: 'Большая полуось', value: '0.387 а.е.' },
        { label: 'Эксцентриситет', value: '0.205' },
        { label: 'Орбитальная скорость', value: '47.87 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '3.301 × 10²³ кг' },
        { label: 'Диаметр', value: '4 879 км' },
        { label: 'Гравитация', value: '3.7 м/с²' },
        { label: 'Плотность', value: '5.43 г/см³' },
      ],
      temperature: [
        { label: 'Дневная сторона', value: 'до +430°C' },
        { label: 'Ночная сторона', value: 'до -180°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'Почти отсутствует (следы He, Na, O)' },
      ],
    },
  },
  {
    id: 'venus',
    name: 'Венера',
    color: '#e8cda0',
    orbitRadius: 105,
    size: 14,
    orbitalPeriod: 0.615,
    imgPath: 'public/venus/venus1.png',
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '224.7 дней (0.615 года)' },
        { label: 'Большая полуось', value: '0.723 а.е.' },
        { label: 'Эксцентриситет', value: '0.007' },
        { label: 'Орбитальная скорость', value: '35.02 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '4.867 × 10²⁴ кг' },
        { label: 'Диаметр', value: '12 104 км' },
        { label: 'Гравитация', value: '8.87 м/с²' },
        { label: 'Плотность', value: '5.24 г/см³' },
      ],
      temperature: [
        { label: 'Средняя', value: '+462°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'CO₂ (96%), N₂ (3.5%)' },
        { label: 'Давление', value: '92 атм' },
      ],
    },
  },
  {
    id: 'earth',
    name: 'Земля',
    color: '#6b93d6',
    orbitRadius: 145,
    size: 14,
    orbitalPeriod: 1,
    imgPath: 'public/earth/earth1.png',
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '365.25 дней (1 год)' },
        { label: 'Большая полуось', value: '1 а.е.' },
        { label: 'Эксцентриситет', value: '0.017' },
        { label: 'Орбитальная скорость', value: '29.78 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '5.972 × 10²⁴ кг' },
        { label: 'Диаметр', value: '12 756 км' },
        { label: 'Гравитация', value: '9.81 м/с²' },
        { label: 'Плотность', value: '5.51 г/см³' },
      ],
      temperature: [
        { label: 'Мин.', value: '-89°C' },
        { label: 'Макс.', value: '+57°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'N₂ (78%), O₂ (21%), Ar (0.9%)' },
      ],
    },
  },
  {
    id: 'mars',
    name: 'Марс',
    color: '#c1440e',
    orbitRadius: 190,
    size: 12,
    orbitalPeriod: 1.88,
    imgPath: 'public/mars/mars1.png',
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '687 дней (1.88 года)' },
        { label: 'Большая полуось', value: '1.524 а.е.' },
        { label: 'Эксцентриситет', value: '0.093' },
        { label: 'Орбитальная скорость', value: '24.07 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '6.417 × 10²³ кг' },
        { label: 'Диаметр', value: '6 792 км' },
        { label: 'Гравитация', value: '3.72 м/с²' },
        { label: 'Плотность', value: '3.93 г/см³' },
      ],
      temperature: [
        { label: 'Мин.', value: '-87°C' },
        { label: 'Макс.', value: '-5°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'CO₂ (95%), N₂ (2.7%), Ar (1.6%)' },
        { label: 'Давление', value: '0.006 атм' },
      ],
    },
  },
  {
    id: 'jupiter',
    name: 'Юпитер',
    color: '#c88b3a',
    orbitRadius: 250,
    size: 28,
    orbitalPeriod: 11.86,
    imgPath: null,
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '11.86 лет' },
        { label: 'Большая полуось', value: '5.203 а.е.' },
        { label: 'Эксцентриситет', value: '0.048' },
        { label: 'Орбитальная скорость', value: '13.07 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '1.898 × 10²⁷ кг' },
        { label: 'Диаметр', value: '142 984 км' },
        { label: 'Гравитация', value: '24.79 м/с²' },
        { label: 'Плотность', value: '1.33 г/см³' },
      ],
      temperature: [
        { label: 'Средняя', value: '-108°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'H₂ (90%), He (10%)' },
      ],
    },
  },
  {
    id: 'saturn',
    name: 'Сатурн',
    color: '#e0c080',
    orbitRadius: 310,
    size: 24,
    orbitalPeriod: 29.46,
    imgPath: null,
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '29.46 лет' },
        { label: 'Большая полуось', value: '9.537 а.е.' },
        { label: 'Эксцентриситет', value: '0.054' },
        { label: 'Орбитальная скорость', value: '9.68 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '5.683 × 10²⁶ кг' },
        { label: 'Диаметр', value: '120 536 км' },
        { label: 'Гравитация', value: '10.44 м/с²' },
        { label: 'Плотность', value: '0.69 г/см³' },
      ],
      temperature: [
        { label: 'Средняя', value: '-139°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'H₂ (96%), He (3%)' },
      ],
    },
  },
  {
    id: 'uranus',
    name: 'Уран',
    color: '#7ec8e3',
    orbitRadius: 365,
    size: 18,
    orbitalPeriod: 84.01,
    imgPath: null,
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '84.01 года' },
        { label: 'Большая полуось', value: '19.191 а.е.' },
        { label: 'Эксцентриситет', value: '0.047' },
        { label: 'Орбитальная скорость', value: '6.80 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '8.681 × 10²⁵ кг' },
        { label: 'Диаметр', value: '51 118 км' },
        { label: 'Гравитация', value: '8.87 м/с²' },
        { label: 'Плотность', value: '1.27 г/см³' },
      ],
      temperature: [
        { label: 'Средняя', value: '-197°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'H₂ (83%), He (15%), CH₄ (2%)' },
      ],
    },
  },
  {
    id: 'neptune',
    name: 'Нептун',
    color: '#3b5c9c',
    orbitRadius: 415,
    size: 17,
    orbitalPeriod: 164.8,
    imgPath: null,
    info: {
      orbital: [
        { label: 'Орбитальный период', value: '164.8 года' },
        { label: 'Большая полуось', value: '30.069 а.е.' },
        { label: 'Эксцентриситет', value: '0.009' },
        { label: 'Орбитальная скорость', value: '5.43 км/с' },
      ],
      physical: [
        { label: 'Масса', value: '1.024 × 10²⁶ кг' },
        { label: 'Диаметр', value: '49 528 км' },
        { label: 'Гравитация', value: '11.15 м/с²' },
        { label: 'Плотность', value: '1.64 г/см³' },
      ],
      temperature: [
        { label: 'Средняя', value: '-201°C' },
      ],
      atmosphere: [
        { label: 'Состав', value: 'H₂ (80%), He (19%), CH₄ (1%)' },
      ],
    },
  },
];

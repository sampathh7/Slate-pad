import { ChildAgeBracket, ChildAgeConfig, AdaptiveQuestionItem } from '../types';

export const CHILD_AGE_CONFIGS: Record<ChildAgeBracket, ChildAgeConfig> = {
  '6-7': {
    id: '6-7',
    label: 'Ages 6-7',
    sublabel: 'Little Sprouts',
    badge: '🌱 Ages 6-7',
    icon: '🌱',
    grades: 'Grades 1 - 2',
    color: '#8FBF8A',
    bgClass: 'bg-[#8FBF8A]/15 text-[#8FBF8A]',
    borderClass: 'border-[#8FBF8A]/40',
    description: 'Pictures, counting stars, simple additions (+), shapes, and fun halves!',
    defaultTopics: [
      '🍎 Star & Apple Counting',
      '➕ Fun Addition (1 to 20)',
      '➖ Subtraction Adventure',
      '⭕ Shapes & Drawing',
      '🍕 Pizza Halves & Fourths',
      '⏰ Clock Hours',
    ],
    defaultQuestions: {
      '🍎 Star & Apple Counting': [
        'Draw 5 shiny stars ⭐ with yellow chalk and count them aloud!',
        'Draw 4 red apples and 2 green apples. How many apples in total?',
        'Draw 7 balloons 🎈 floating in the air!',
        'Draw 3 happy fish swimming in a pond 🐟.',
      ],
      '➕ Fun Addition (1 to 20)': [
        'What is 4 + 3? Draw 4 circles and 3 circles, then count the total!',
        'Calculate 5 + 5. Write the numbers and draw 10 dots on your chalkboard.',
        'If you have 6 toys and get 2 more, how many toys do you have? Write 6 + 2 = ?',
        'Solve 7 + 1 on the slate.',
      ],
      '➖ Subtraction Adventure': [
        'If you have 6 cookies 🍪 and eat 2, how many cookies are left? Write 6 - 2 = ?',
        'Draw 5 dots, cross out 3 of them with chalk. How many dots are left?',
        'Solve 8 - 4 on the chalkboard.',
        'You have 10 stickers and give 5 to a friend. Write 10 - 5 = ?',
      ],
      '⭕ Shapes & Drawing': [
        'Draw a big Square ⏹️ and a Triangle 🔺 with your chalk.',
        'Draw a Circle ⭕ and cut it in half with a straight chalk line.',
        'Draw a 5-pointed star ⭐ on your chalkboard.',
        'Draw a Rectangle ▭ with 4 straight sides.',
      ],
      '🍕 Pizza Halves & Fourths': [
        'Draw a big round pizza 🍕 and cut it into 2 equal halves (1/2)!',
        'Draw a pizza cut into 4 equal slices. Color in 1 slice with chalk (1/4)!',
        'Draw 2 cookie circles and color 1 of them.',
      ],
      '⏰ Clock Hours': [
        'Draw a clock showing 3:00 (draw the hour hand pointing to 3)!',
        'Draw a circle clock showing 12:00 with both hands pointing up.',
      ],
    },
  },
  '8-9': {
    id: '8-9',
    label: 'Ages 8-9',
    sublabel: 'Junior Explorers',
    badge: '🚀 Ages 8-9',
    icon: '🚀',
    grades: 'Grades 3 - 4',
    color: '#E8C468',
    bgClass: 'bg-[#E8C468]/15 text-[#E8C468]',
    borderClass: 'border-[#E8C468]/40',
    description: 'Times tables (×), pizza fractions, perimeter, time intervals, and space word drills!',
    defaultTopics: [
      '🍕 Pizza Fractions',
      '✖️ Times Tables (2 to 10)',
      '➗ Fair Sharing & Division',
      '📐 Perimeter & Shapes',
      '🚀 Space Word Problems',
      '⏳ Clock & Minutes',
    ],
    defaultQuestions: {
      '🍕 Pizza Fractions': [
        'Draw a pizza divided into 4 equal slices and color in 3/4 with chalk.',
        'If you have 8 slices and eat 3, what fraction is left on the chalkboard?',
        'Show that 2/4 is equal to 1/2 using two chalk drawings.',
        'Draw a chocolate bar divided into 6 pieces and shade 4/6.',
      ],
      '✖️ Times Tables (2 to 10)': [
        'Calculate 6 × 4. Draw 6 rows of 4 chalk dots to prove your answer!',
        'What is 7 × 3? Write the multiplication on the slate.',
        'Solve 8 × 5 and show how it relates to 5 × 8.',
        'Draw an array for 4 × 4 (a 4-by-4 grid of dots).',
      ],
      '➗ Fair Sharing & Division': [
        'If 3 astronauts share 15 moon rocks equally, how many does each get? Write 15 ÷ 3 = ?',
        'Calculate 24 ÷ 4 on the chalkboard.',
        'Share 18 candies among 6 friends. Show the grouping on the slate.',
        'Solve 30 ÷ 5 step-by-step.',
      ],
      '📐 Perimeter & Shapes': [
        'Draw a rectangle with width 4 and length 6. Calculate its perimeter: 2 × (4 + 6).',
        'A square has sides of length 5 cm. Find its total perimeter on the slate.',
        'Draw a triangle with side lengths 3, 4, and 5. Find the perimeter.',
      ],
      '🚀 Space Word Problems': [
        'A rocket flies 50 miles in 1 minute. How far does it travel in 4 minutes? Write 50 × 4 = ?',
        'Alien Zara collected 40 stardust crystals in jars of 8. How many jars does Zara need?',
      ],
      '⏳ Clock & Minutes': [
        'Draw a clock showing 4:45 with the hour and minute hands.',
        'A movie starts at 2:15 and lasts 45 minutes. What time does it end?',
      ],
    },
  },
  '10-12': {
    id: '10-12',
    label: 'Ages 10-12',
    sublabel: 'Math Champions',
    badge: '🏆 Ages 10-12',
    icon: '🏆',
    grades: 'Grades 5 - 7',
    color: '#81D4FA',
    bgClass: 'bg-[#81D4FA]/15 text-[#81D4FA]',
    borderClass: 'border-[#81D4FA]/40',
    description: 'Fraction addition, decimals, pre-algebra (2x+6=14), angles, area & volume, and logic!',
    defaultTopics: [
      '🧮 Fractions & Decimals',
      '⚖️ Pre-Algebra Balance',
      '📐 Geometry & Angles',
      '📦 Area & Volume',
      '📊 Percentages & Discounts',
      '🔬 Speed & Scientific Math',
    ],
    defaultQuestions: {
      '🧮 Fractions & Decimals': [
        'Calculate 3/4 + 2/3. Show the common denominator (12) step-by-step.',
        'Multiply 2/5 × 3/7 and simplify the fraction.',
        'Convert 3/8 into a decimal using long division on the slate.',
        'Solve: 1.25 + 3.48 on the chalkboard with proper decimal alignment.',
      ],
      '⚖️ Pre-Algebra Balance': [
        'Solve for x in: 3x + 9 = 24. Show both balance steps on the chalkboard.',
        'Solve: 5x - 7 = 23 and verify your answer by substitution.',
        'Solve: 2(x + 4) = 18 by expanding the bracket or dividing first.',
        'If 4y + 12 = 36, find the value of y.',
      ],
      '📐 Geometry & Angles': [
        'Draw a right-angle triangle with legs 3 and 4. Find the hypotenuse using a² + b² = c².',
        'A triangle has angles 45° and 65°. Find the third unknown angle (sum is 180°).',
        'Draw two intersecting lines and identify vertical opposite angles.',
      ],
      '📦 Area & Volume': [
        'Find the area of a rectangle with length 12 cm and width 7 cm: Area = L × W.',
        'Calculate the volume of a rectangular prism with length 5, width 4, height 3: V = L × W × H.',
        'Find the area of a triangle with base 8 and height 6: Area = (1/2) × b × h.',
      ],
      '📊 Percentages & Discounts': [
        'A $60 jacket is on a 25% discount. Calculate the discount amount and final price.',
        'What is 15% of 80? Show your chalk working step-by-step.',
        'Express 18 out of 25 as a percentage (18/25 × 100%).',
      ],
      '🔬 Speed & Scientific Math': [
        'A train travels 150 km in 3 hours. Calculate its average speed in km/h: Speed = Distance ÷ Time.',
        'Water freezes at 0°C (32°F). If temperature rises 15°C, what is the new temperature?',
      ],
    },
  },
};

const STORAGE_AGE_KEY = 'slate_student_age_bracket';

export function getStoredAgeBracket(): ChildAgeBracket {
  try {
    const saved = localStorage.getItem(STORAGE_AGE_KEY);
    if (saved && (saved === '6-7' || saved === '8-9' || saved === '10-12')) {
      return saved as ChildAgeBracket;
    }
  } catch {
    // ignore
  }
  return '6-7'; // default to Little Sprouts (6-7 years)
}

export function saveAgeBracket(age: ChildAgeBracket) {
  try {
    localStorage.setItem(STORAGE_AGE_KEY, age);
  } catch {
    // ignore
  }
}

export function getAgeAdaptiveQuestions(age: ChildAgeBracket, topic: string): AdaptiveQuestionItem[] {
  const config = CHILD_AGE_CONFIGS[age] || CHILD_AGE_CONFIGS['8-9'];
  const questions = config.defaultQuestions[topic] || Object.values(config.defaultQuestions)[0] || [
    'Draw and solve the math problem on the chalkboard!',
  ];

  return questions.map((q, idx) => ({
    id: `q-${age}-${idx}`,
    question: q,
    difficulty: idx === 0 ? 'Foundational' : idx === 1 ? 'Standard' : idx === 2 ? 'Stretch' : 'Challenge',
    learningGoal: `${config.sublabel} skill building for ${topic}`,
    scaffoldingHint:
      age === '6-7'
        ? 'Draw shapes or dots to count step by step!'
        : age === '8-9'
        ? 'Break the problem down and write your numbers clearly on the chalkboard.'
        : 'State your formula first, then solve step-by-step with chalk.',
    adaptiveReason: `Tailored for ${config.grades} (${config.label})`,
  }));
}

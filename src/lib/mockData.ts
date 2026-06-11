// Mock Data & Interview Question bank for Job Portal Platform

export interface MockJob {
  id: string;
  title: string;
  companyName: string;
  logo: string;
  description: string;
  skillsRequired: string[];
  salary: string;
  location: string;
  jobType: 'FULL_TIME' | 'INTERNSHIP' | 'WFH';
  remote: boolean;
  experienceLevel: 'ENTRY_LEVEL' | '0-1_YEARS' | '1-3_YEARS';
  deadline: string;
  selectionProcess: string;
  category: 'Off-Campus' | 'Walk-In Drive' | 'Internship' | 'Regular';
  reviewsCount: number;
  rating: number;
}

export interface PrepQuestion {
  id: string;
  category: 'Java' | 'Python' | 'SQL' | 'Aptitude' | 'HR';
  question: string;
  options?: string[]; // for MCQ
  correctOption?: number; // 0-indexed for MCQ
  sampleAnswer?: string; // for HR/Interview Prep descriptive answers
}

export const MOCK_JOBS: MockJob[] = [
  {
    id: 'job-1',
    title: 'Associate Software Engineer (Java)',
    companyName: 'TechVantage Solutions',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=80&h=80&fit=crop',
    description: 'We are looking for enthusiastic Freshers to join our backend engineering team. You will work on writing clean Java code, developing enterprise microservices using Spring Boot, and managing relational databases.',
    skillsRequired: ['Java', 'Spring Boot', 'SQL', 'Git', 'Data Structures'],
    salary: '₹6.5 - ₹8.0 LPA',
    location: 'Bangalore, India',
    jobType: 'FULL_TIME',
    remote: false,
    experienceLevel: 'ENTRY_LEVEL',
    deadline: '2026-06-30',
    selectionProcess: 'Aptitude Test -> Coding Challenge -> Technical Interview -> HR Round',
    category: 'Off-Campus',
    reviewsCount: 18,
    rating: 4.2
  },
  {
    id: 'job-2',
    title: 'Frontend Developer Intern (React)',
    companyName: 'AestheticUI Lab',
    logo: 'https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=80&h=80&fit=crop',
    description: 'Join our design-forward engineering team building premium Next.js SaaS products. As a React Intern, you will participate in implementing beautiful Tailwind CSS templates, Framer Motion animations, and API integrations.',
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML', 'CSS'],
    salary: '₹25,000 - ₹35,000 / month',
    location: 'Remote, India',
    jobType: 'INTERNSHIP',
    remote: true,
    experienceLevel: 'ENTRY_LEVEL',
    deadline: '2026-06-25',
    selectionProcess: 'Resume Screening -> Portfolio Review -> Take-home UI Challenge -> Interview',
    category: 'Internship',
    reviewsCount: 6,
    rating: 4.8
  },
  {
    id: 'job-3',
    title: 'Graduate Engineer Trainee (Python & ML)',
    companyName: 'Cognitive Automation Systems',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=80&fit=crop',
    description: 'A fantastic entry-level opportunity for recent B.Tech/MCA grads who are passionate about Python, data analysis, scripting, and building machine learning pipelines. You will get hands-on training from AI architects.',
    skillsRequired: ['Python', 'SQL', 'Algorithms', 'Mathematics', 'Git'],
    salary: '₹5.0 - ₹7.0 LPA',
    location: 'Hyderabad, India',
    jobType: 'FULL_TIME',
    remote: false,
    experienceLevel: 'ENTRY_LEVEL',
    deadline: '2026-07-10',
    selectionProcess: 'Online Python Assessment -> Technical Hackathon -> Technical Interview',
    category: 'Off-Campus',
    reviewsCount: 24,
    rating: 4.0
  },
  {
    id: 'job-4',
    title: 'Junior Web Developer (Node.js & Express)',
    companyName: 'CloudSphere Technologies',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop',
    description: 'We are hosting a massive walk-in drive at our Chennai campus. Seeking entry-level backend engineers capable of building RESTful API endpoints with Express, connecting databases, and optimizing query speeds.',
    skillsRequired: ['Node.js', 'Express', 'JavaScript', 'SQL', 'PostgreSQL'],
    salary: '₹4.5 - ₹6.0 LPA',
    location: 'Chennai, India',
    jobType: 'FULL_TIME',
    remote: false,
    experienceLevel: '0-1_YEARS',
    deadline: '2026-06-15',
    selectionProcess: 'Walk-In Written Test (SQL & JS) -> Live Coding Round -> Face-to-Face Technical -> HR Panel',
    category: 'Walk-In Drive',
    reviewsCount: 12,
    rating: 3.9
  },
  {
    id: 'job-5',
    title: 'Full Stack Engineer (MERN Stack)',
    companyName: 'InnovateX Ventures',
    logo: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=80&h=80&fit=crop',
    description: 'Excellent off-campus drive opportunity. Looking for Final-Year Students or Recent Graduates who have built MERN Stack projects. You will build and deploy responsive end-to-end user interfaces and API microservices.',
    skillsRequired: ['React', 'Node.js', 'Express', 'JavaScript', 'MongoDB', 'CSS'],
    salary: '₹8.0 - ₹12.0 LPA',
    location: 'Pune, India',
    jobType: 'FULL_TIME',
    remote: true,
    experienceLevel: 'ENTRY_LEVEL',
    deadline: '2026-06-20',
    selectionProcess: 'Online Fullstack MCQ -> Coding Challenge -> Technical & System Design Round',
    category: 'Off-Campus',
    reviewsCount: 32,
    rating: 4.4
  }
];

export const PREP_QUESTIONS: PrepQuestion[] = [
  // Aptitude
  {
    id: 'apt-1',
    category: 'Aptitude',
    question: 'A train 120 m long passes a telegraph post in 6 seconds. What is the speed of the train in km/hr?',
    options: ['60 km/hr', '72 km/hr', '80 km/hr', '90 km/hr'],
    correctOption: 1
  },
  {
    id: 'apt-2',
    category: 'Aptitude',
    question: 'A and B together can do a piece of work in 12 days, which B alone can do in 30 days. In how many days can A alone do the work?',
    options: ['18 days', '20 days', '24 days', '15 days'],
    correctOption: 1
  },
  {
    id: 'apt-3',
    category: 'Aptitude',
    question: 'If the price of sugar increases by 25%, by what percentage should a household reduce its consumption so that the expenditure remains the same?',
    options: ['15%', '20%', '25%', '30%'],
    correctOption: 1
  },
  // Java
  {
    id: 'java-1',
    category: 'Java',
    question: 'Which of the following is NOT a feature of Object-Oriented Programming (OOP) in Java?',
    options: ['Inheritance', 'Polymorphism', 'Pointers', 'Encapsulation'],
    correctOption: 2
  },
  {
    id: 'java-2',
    category: 'Java',
    question: 'What is the default value of a boolean variable in Java if it is defined as a class member?',
    options: ['true', 'false', 'null', '0'],
    correctOption: 1
  },
  {
    id: 'java-3',
    category: 'Java',
    question: 'Explain the difference between final, finally, and finalize in Java.',
    sampleAnswer: '1. final: A keyword used to declare constants (variables that cannot be changed), prevent method overriding, or prevent inheritance (final classes).\n2. finally: A block used in exception handling that executes regardless of whether an exception is thrown or caught.\n3. finalize: A protected method in the Object class that the garbage collector calls before destroying an object (deprecated in modern Java).'
  },
  // Python
  {
    id: 'py-1',
    category: 'Python',
    question: 'What is the correct syntax to define a list comprehension that filters even numbers from a range of 1 to 10?',
    options: [
      '[x for x in range(1, 11) if x % 2 == 0]',
      '[x if x % 2 == 0 for x in range(1, 11)]',
      '[for x in range(1, 11) if x % 2 == 0: x]',
      '[x for x in range(1, 11) where x % 2 == 0]'
    ],
    correctOption: 0
  },
  {
    id: 'py-2',
    category: 'Python',
    question: 'Is Python list mutable or immutable? What about a tuple?',
    options: [
      'List is mutable, Tuple is mutable',
      'List is immutable, Tuple is mutable',
      'List is mutable, Tuple is immutable',
      'List is immutable, Tuple is immutable'
    ],
    correctOption: 2
  },
  {
    id: 'py-3',
    category: 'Python',
    question: 'Explain what decorators are in Python and how they are used.',
    sampleAnswer: 'Decorators are a structural tool in Python that allows you to modify or extend the behavior of a function or class without permanently changing its source code. They are represented by the "@decorator_name" syntax directly above the function definition. Internally, a decorator is a wrapper function that takes another function as an argument, performs some pre/post actions, and returns a new callable function.'
  },
  // SQL
  {
    id: 'sql-1',
    category: 'SQL',
    question: 'Which SQL keyword is used to remove duplicate rows from a query result set?',
    options: ['UNIQUE', 'DISTINCT', 'GROUP BY', 'LIMIT'],
    correctOption: 1
  },
  {
    id: 'sql-2',
    category: 'SQL',
    question: 'What is the difference between Inner Join and Left Join?',
    options: [
      'Inner Join returns all rows; Left Join only returns matching rows',
      'Inner Join only returns rows with matching values in both tables; Left Join returns all rows from the left table and matched rows from the right',
      'Inner Join returns unmatched rows; Left Join does not',
      'There is no difference in execution speed or behavior'
    ],
    correctOption: 1
  },
  {
    id: 'sql-3',
    category: 'SQL',
    question: 'What is the difference between WHERE and HAVING clauses in SQL?',
    sampleAnswer: 'The WHERE clause is used to filter records before any groupings are applied, and it cannot contain aggregate functions (like SUM, COUNT, AVG). The HAVING clause is used to filter groups created by the GROUP BY clause, and it is executed after grouping, allowing aggregate functions to be used in its filter criteria.'
  },
  // HR
  {
    id: 'hr-1',
    category: 'HR',
    question: 'Tell me about yourself.',
    sampleAnswer: 'Focus on the "Present-Past-Future" formula: Briefly describe your current status (e.g. final year student of B.Tech in CSE with a 8.5 CGPA), detail 1-2 major projects or internships where you solved coding challenges (e.g. building a fullstack inventory app), and conclude with why you are excited about this entry-level role and how it aligns with your career path.'
  },
  {
    id: 'hr-2',
    category: 'HR',
    question: 'Why should we hire you as a fresher?',
    sampleAnswer: 'Emphasize your strong academic foundation, your quick learning ability, and your projects. Explain that while you do not have years of industry experience, you have hands-on project experience in React/Node.js, you are highly adaptable, and you are ready to bring fresh perspective and high energy to the engineering team from day one.'
  },
  {
    id: 'hr-3',
    category: 'HR',
    question: 'How do you handle feedback or criticism on your code?',
    sampleAnswer: 'State that you view code reviews and feedback as an essential learning opportunity rather than a personal critique. Mention that as a fresher, you appreciate learning best practices from senior engineers, and you enjoy understanding *why* a certain optimization or design pattern is preferred so you can write better code in future sprints.'
  }
];

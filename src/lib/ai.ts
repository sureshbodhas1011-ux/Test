// Mock AI Engine for Job Portal - Simulates ATS Scoring, Resume Review, Skill Gaps, and Interview Feedback

export interface ATSReviewResult {
  score: number;
  grammarScore: number;
  formattingScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  improvements: string[];
}

export interface SkillGapResult {
  targetRole: string;
  matchScore: number;
  missingSkills: string[];
  recommendations: { title: string; source: string; url: string }[];
}

export interface InterviewEvaluationResult {
  score: number; // 0 to 100
  feedback: string;
  strongPoints: string[];
  improvements: string[];
}

// Common tech keywords
const TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'postgresql', 'mongodb',
  'sqlite', 'git', 'github', 'docker', 'aws', 'html', 'css', 'tailwind css', 'python', 'java', 'sql',
  'rest api', 'graphql', 'algorithms', 'data structures', 'object-oriented programming', 'agile'
];

/**
 * Calculates ATS Score & detailed review for a resume text
 */
export function analyzeResumeATS(resumeText: string, targetJobTitle?: string): ATSReviewResult {
  const text = resumeText.toLowerCase();
  
  // Clean text and count matches
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  
  TECH_KEYWORDS.forEach(keyword => {
    if (text.includes(keyword)) {
      matchedKeywords.push(keyword.toUpperCase());
    } else {
      missingKeywords.push(keyword.toUpperCase());
    }
  });

  // Simple heuristic scoring
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / Math.min(12, TECH_KEYWORDS.length)) * 100));
  
  // Simulated scores
  const hasFormatting = text.includes('education') || text.includes('experience') || text.includes('projects');
  const formattingScore = hasFormatting ? 90 : 45;
  const grammarScore = text.length > 150 ? 88 : 55;
  
  const finalScore = Math.round((keywordScore * 0.5) + (formattingScore * 0.3) + (grammarScore * 0.2));

  const improvements: string[] = [];
  if (missingKeywords.length > 0) {
    improvements.push(`Add relevant technical keywords like ${missingKeywords.slice(0, 3).join(', ')}.`);
  }
  if (!text.includes('project')) {
    improvements.push('Add a dedicated "Projects" section detailing your entry-level work or academic repositories.');
  }
  if (!text.includes('education') || text.includes('degree')) {
    improvements.push('Verify that your degree status, GPA, and college name are prominently displayed under Education.');
  }
  if (text.length < 200) {
    improvements.push('Expand your profile descriptions to include project impact, metrics, or tools utilized.');
  }

  return {
    score: finalScore,
    grammarScore,
    formattingScore,
    matchedKeywords,
    missingKeywords: missingKeywords.slice(0, 5),
    improvements: improvements.length > 0 ? improvements : ['Your resume looks highly optimized for freshers drives!']
  };
}

/**
 * Performs Skill Gap analysis based on student skills and target job details
 */
export function analyzeSkillGaps(studentSkills: string[], targetJobTitle: string, jobSkillsRequired: string[]): SkillGapResult {
  const studentSkillsLower = studentSkills.map(s => s.toLowerCase());
  const jobSkillsLower = jobSkillsRequired.map(s => s.toLowerCase());

  const matched = jobSkillsLower.filter(skill => studentSkillsLower.some(s => s.includes(skill) || skill.includes(s)));
  const missing = jobSkillsRequired.filter((_, idx) => !studentSkillsLower.some(s => s.includes(jobSkillsLower[idx]) || jobSkillsLower[idx].includes(s)));

  const matchScore = jobSkillsRequired.length > 0 
    ? Math.round((matched.length / jobSkillsRequired.length) * 100) 
    : 100;

  const recommendations = missing.map(skill => {
    return {
      title: `Master ${skill} foundations`,
      source: skill.toLowerCase().includes('react') || skill.toLowerCase().includes('next') 
        ? 'Official Docs' 
        : 'freeCodeCamp / MDN Web Docs',
      url: skill.toLowerCase().includes('react') 
        ? 'https://react.dev' 
        : 'https://developer.mozilla.org'
    };
  });

  return {
    targetRole: targetJobTitle,
    matchScore,
    missingSkills: missing,
    recommendations: recommendations.length > 0 ? recommendations : [{ title: 'All skills matched! Explore advanced design patterns.', source: 'GitHub Guides', url: 'https://github.com' }]
  };
}

/**
 * Simulates evaluating an interview response
 */
export function evaluateInterviewAnswer(questionText: string, answerText: string): InterviewEvaluationResult {
  const answer = answerText.trim().toLowerCase();
  
  if (answer.length < 15) {
    return {
      score: 30,
      feedback: 'The answer is too brief. Try to structure your responses using the STAR method (Situation, Task, Action, Result) for behavioral questions, or explain logic step-by-step for technical questions.',
      strongPoints: ['Attempted the question.'],
      improvements: ['Elaborate significantly on your implementation details or explanation.', 'Use specific terminology or examples.']
    };
  }

  // Look for keywords
  const positiveMarkers = ['example', 'because', 'first', 'then', 'database', 'query', 'react', 'component', 'use', 'function', 'class', 'design', 'process', 'project', 'resolved', 'learned'];
  const matchedMarkers = positiveMarkers.filter(marker => answer.includes(marker));

  const baseScore = Math.min(95, Math.round(55 + (matchedMarkers.length * 5) + (answer.length / 50)));

  const strongPoints: string[] = [];
  const improvements: string[] = [];

  if (answer.includes('example') || answer.includes('project')) {
    strongPoints.push('Good usage of reference projects or contextual examples.');
  } else {
    improvements.push('Include a real-world project example to substantiate your answer.');
  }

  if (answer.includes('database') || answer.includes('query') || answer.includes('api')) {
    strongPoints.push('Demonstrated technical vocabulary relevant to backend operations.');
  }

  if (answer.length > 250) {
    strongPoints.push('Detailed elaboration showing deep explanation ability.');
  } else {
    improvements.push('Expand your answer further to display comprehensive conceptual understanding.');
  }

  return {
    score: baseScore,
    feedback: baseScore > 75 
      ? 'Excellent answer! You demonstrated solid command over the concept and structured it with helpful terminology.' 
      : 'Good effort. The answer is on the right track but lacks specific execution details or complete technical explanations.',
    strongPoints: strongPoints.length > 0 ? strongPoints : ['Clear expression of ideas.'],
    improvements: improvements.length > 0 ? improvements : ['Your response is polished. Practice speaking it aloud under a time limit!']
  };
}

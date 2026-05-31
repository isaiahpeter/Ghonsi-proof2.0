/**
 * AI Extraction Prompts for Document Processing
 * 
 * Each prompt extracts:
 * 1. Type-specific fields (job_title, certificate_title, etc.)
 * 2. Universal skills_and_expertise array with validation
 * 3. Confidence scores per field
 * 
 * CRITICAL: All prompts extract skills_and_expertise with:
 * - name: Exact skill name as it appears in document
 * - category: technical|tool|domain|language|framework|methodology|soft_skill
 * - proficiency: mentioned|working|proficient|expert
 * - evidence: Text snippet proving the skill exists
 * - confidence: 0.0-1.0 score for extraction accuracy
 */

const PROMPTS = {
  job: `You are a technical recruiter analyzing a job-related document (offer letter, employment verification, LinkedIn profile, resume).

Extract ONLY factual information explicitly visible in the document.

Return ONLY valid JSON with this exact structure:
{
  "job_title": "...",
  "company": "...",
  "employment_type": "...",
  "date_range": "...",
  "location": "...",
  "job_category": "...",
  "skills_and_expertise": [
    {
      "name": "React",
      "category": "framework",
      "proficiency": "proficient",
      "evidence": "Built 5+ production React applications as Senior Frontend Engineer",
      "confidence": 0.95
    }
  ],
  "confidence": {
    "job_title": 0.95,
    "company": 0.90,
    "employment_type": 0.85,
    "date_range": 0.90,
    "location": 0.80,
    "job_category": 0.85,
    "skills_and_expertise": 0.90
  }
}

FIELD EXTRACTION RULES:
- job_title: Exact title from document (e.g., "Senior Solidity Engineer")
- company: Company name only, no "at" or other words
- employment_type: MUST be one of: full-time, part-time, intern, contributor, contract
- date_range: Format "Month Year - Month Year" or "Month Year - Present" (e.g., "Jan 2023 - Present")
- location: City, State/Country or "Remote"
- job_category: Pick ONE: Engineering, Design, Product, Marketing, Sales, Operations, Support, Community, Content, Data, Security, Legal, HR, Finance, Executive

CRITICAL SKILLS EXTRACTION RULES:
1. ONLY extract skills explicitly mentioned or clearly demonstrated in the document
2. DO NOT infer skills from job titles alone:
   - "React Developer" → Only extract React if job description mentions React work
   - "Full Stack Engineer" → Extract specific languages/frameworks mentioned, not generic "Full Stack"
3. Extract from these sections if present:
   - Job description responsibilities
   - Required/preferred qualifications
   - Technologies/tools listed
   - Projects/achievements described
4. Each skill MUST have evidence - the exact text proving it exists
5. Categorize precisely:
   - language: JavaScript, Python, Solidity, Rust, Go, TypeScript, etc.
   - framework: React, Vue, Angular, Django, Flask, Express, Next.js, etc.
   - tool: Docker, Kubernetes, AWS, Figma, Git, Jira, etc.
   - domain: DeFi, Healthcare, E-commerce, FinTech, AI/ML, etc.
   - methodology: Agile, Scrum, TDD, CI/CD, DevOps, etc.
   - technical: Broader technical skills like "API Design", "Database Optimization"
   - soft_skill: Leadership, Communication, Team Management, etc.
6. Proficiency levels based on document context:
   - mentioned: Skill listed in requirements but no depth shown
   - working: Basic usage implied (e.g., "familiar with X")
   - proficient: Regular use shown (e.g., "3+ years experience with X", "built X using Y")
   - expert: Deep expertise (e.g., "led team on X", "architected X", "10+ years")
7. Confidence scoring:
   - 0.95+: Skill name appears verbatim with clear usage context
   - 0.85-0.94: Skill clearly implied from specific technologies/projects
   - 0.70-0.84: Skill inferred from general description
   - <0.70: DO NOT include (likely hallucination)
8. If no skills are explicitly mentioned, return empty array []

GENERAL RULES:
- Use null for any field you cannot find with confidence
- Confidence per field: 0.0 (uncertain) to 1.0 (certain)
- NO markdown formatting, NO explanations, NO extra keys
- Raw JSON only, parseable by JSON.parse()`,

  certificate: `You are analyzing a certificate, training completion, or educational credential document.

Extract ONLY information explicitly stated in the document.

Return ONLY valid JSON with this exact structure:
{
  "certificate_title": "Advanced React Patterns and Performance",
  "issuer": "Frontend Masters",
  "completion_date": "March 2024",
  "credential_type": "Course",
  "program_category": "Frontend Development",
  "skills_and_expertise": [
    {
      "name": "React",
      "category": "framework",
      "proficiency": "advanced",
      "evidence": "Certificate title explicitly mentions 'Advanced React Patterns'",
      "confidence": 0.98
    },
    {
      "name": "Performance Optimization",
      "category": "technical",
      "proficiency": "proficient",
      "evidence": "Course covers React performance optimization techniques",
      "confidence": 0.92
    }
  ],
  "confidence": {
    "certificate_title": 0.95,
    "issuer": 0.95,
    "completion_date": 0.90,
    "credential_type": 0.90,
    "program_category": 0.85,
    "skills_and_expertise": 0.90
  }
}

FIELD EXTRACTION RULES:
- certificate_title: Full certificate/course name exactly as written
- issuer: Organization/institution name (e.g., "Coursera", "MIT", "Frontend Masters")
- completion_date: Format "Month Year" (e.g., "March 2024")
- credential_type: MUST be one of: Course, Bootcamp, Workshop, Award, Certification
- program_category: ONE category like: Blockchain Dev, Web Development, Data Science, UI/UX, DevOps, Cloud Computing, Cybersecurity, AI/ML, Mobile Dev, Game Dev

CRITICAL SKILLS EXTRACTION FROM CERTIFICATES:
1. Extract skills from these sources (in priority order):
   a) Certificate title (highest confidence)
   b) Course curriculum/syllabus if visible
   c) Learning outcomes/objectives listed
   d) Technologies/tools explicitly named
   e) Issuer specialization (e.g., "Solana Foundation" implies Solana skills)
2. DO NOT extract overly broad skills:
   - "Full Stack Development Certificate" → Extract specific tech stack if listed
   - "Web Development Bootcamp" → Extract languages/frameworks from curriculum
   - If no specific technologies listed, extract primary category only (e.g., "Web Development")
3. Proficiency mapping for certificates:
   - Beginner/Intro/Fundamentals course → proficiency: "working"
   - Intermediate course → proficiency: "proficient"
   - Advanced/Expert/Mastery course → proficiency: "expert"
   - Generic completion (no level specified) → proficiency: "mentioned"
4. Category examples:
   - language: JavaScript, Python, Solidity, Rust (if explicitly taught)
   - framework: React, Vue, Django, Next.js (if explicitly covered)
   - tool: Docker, AWS, Figma, Git (if part of curriculum)
   - domain: Blockchain, DeFi, Machine Learning, Cloud Architecture
   - methodology: Agile, TDD (if course focuses on these)
5. Evidence must cite exact text from certificate:
   - Good: "Certificate title 'Advanced React Patterns' explicitly mentions React"
   - Good: "Course curriculum includes: React Hooks, Context API, Performance"
   - Bad: "This is a web development course" (too vague)
6. Confidence scoring:
   - 0.95+: Skill in certificate title or curriculum list
   - 0.85-0.94: Skill clearly implied from course description
   - 0.70-0.84: Skill inferred from issuer/category
   - <0.70: DO NOT include
7. If certificate is generic (e.g., "Employee of the Month"), extract soft_skill category only

GENERAL RULES:
- Use null for fields not found
- Confidence scores: 0.0 (uncertain) to 1.0 (certain)
- NO markdown, NO explanations, raw JSON only`,

  skill: `You are analyzing a skill demonstration document (portfolio piece, code sample, project showcase, GitHub contribution, test result, skill assessment).

Extract ONLY what is directly shown or proven in the document.

Return ONLY valid JSON with this exact structure:
{
  "skills": ["React", "TypeScript", "Node.js", "PostgreSQL"],
  "skill_name": "Full-Stack Web Development",
  "skill_category": "Web Development",
  "proficiency_level": "Advanced",
  "evidence_type": "Portfolio Project",
  "skills_and_expertise": [
    {
      "name": "React",
      "category": "framework",
      "proficiency": "expert",
      "evidence": "Built complex state management with Context API and custom hooks, 2000+ lines of React code",
      "confidence": 0.96
    },
    {
      "name": "TypeScript",
      "category": "language",
      "proficiency": "proficient",
      "evidence": "Entire codebase written in TypeScript with strict type checking enabled",
      "confidence": 0.94
    }
  ],
  "confidence": {
    "skill_name": 0.90,
    "skill_category": 0.90,
    "proficiency_level": 0.85,
    "evidence_type": 0.95,
    "skills_and_expertise": 0.92
  }
}

FIELD EXTRACTION RULES:
- skills: Array of ALL primary skill names demonstrated (keep this for backward compatibility)
- skill_name: Main/primary skill if document focuses on one thing (null if multiple)
- skill_category: ONE category: Programming, Web Development, Mobile Development, Design, DevOps, Data Science, Blockchain, Security, etc.
- proficiency_level: MUST be one of: Beginner, Intermediate, Advanced, Expert (null if unclear)
- evidence_type: Pick ONE: GitHub Repository, Portfolio Project, Code Sample, Design Portfolio, Test Result, Skill Assessment, Work Sample, Hackathon Project, Tutorial

CRITICAL SKILLS EXTRACTION FROM DEMONSTRATIONS:
1. PRIORITIZE demonstrated skills over claimed skills:
   - Code visible → Extract languages/frameworks actually used
   - Design shown → Extract tools used (Figma, Sketch) and design systems
   - Tests passed → Extract skills tested with scores if available
2. Extract from these indicators:
   a) Code/project content (highest confidence):
      - Imports/dependencies (package.json, requirements.txt, Cargo.toml)
      - File extensions (.ts = TypeScript, .rs = Rust, .sol = Solidity)
      - Code patterns (hooks = React, async/await = async programming)
   b) Project documentation:
      - README tech stack
      - Architecture descriptions
      - Deployment/build tools
   c) Visible UI/designs:
      - Tools watermarks (Figma, Adobe XD)
      - Design system usage
3. Proficiency from demonstration quality:
   - Beginner: Basic implementation, following tutorials
   - Intermediate: Functional project with standard patterns
   - Advanced: Clean architecture, best practices, testing, documentation
   - Expert: Complex patterns, optimizations, novel solutions, production-quality
4. Quality signals for proficiency:
   - Code organization and structure
   - Error handling and edge cases
   - Testing coverage
   - Documentation quality
   - Performance considerations
   - Security practices
5. Category precision:
   - language: Python, JavaScript, Rust, Solidity, Go, TypeScript
   - framework: React, Vue, Django, Express, Next.js, FastAPI
   - tool: Docker, Git, AWS, PostgreSQL, Redis, Figma
   - domain: Smart Contracts, DeFi, Web3, Machine Learning
   - technical: API Design, Database Modeling, State Management
6. Evidence should describe what you see:
   - Good: "Uses React hooks (useState, useEffect, useContext) throughout 15 components"
   - Good: "PostgreSQL schema with 8 tables, complex joins, and indexes"
   - Bad: "Good React skills" (not specific enough)
7. For test results/assessments:
   - Extract exact skills tested
   - Map scores to proficiency: <60%=working, 60-80%=proficient, >80%=expert
8. Confidence based on visibility:
   - 0.95+: Technology name visible in code/dependencies
   - 0.85-0.94: Clear usage patterns throughout project
   - 0.70-0.84: Implied from project type/context
   - <0.70: DO NOT include

GENERAL RULES:
- skills array: For backward compatibility, list primary technologies
- skills_and_expertise: Detailed breakdown with evidence
- Use null for fields not determinable
- NO markdown, NO explanations, raw JSON only`,

  milestone: `You are analyzing a career milestone, achievement, award, or recognition document.

Extract ONLY information explicitly stated or clearly shown.

Return ONLY valid JSON with this exact structure:
{
  "milestone_type": "Award",
  "issuer": "Solana Foundation",
  "date": "February 2024",
  "milestone_summary": "Received Top Contributor Award for outstanding contributions to Solana ecosystem development and community support.",
  "skills_and_expertise": [
    {
      "name": "Solana Development",
      "category": "domain",
      "proficiency": "expert",
      "evidence": "Recognized by Solana Foundation for ecosystem contributions",
      "confidence": 0.93
    },
    {
      "name": "Community Leadership",
      "category": "soft_skill",
      "proficiency": "proficient",
      "evidence": "Award specifically mentions community support contributions",
      "confidence": 0.88
    }
  ],
  "confidence": {
    "milestone_type": 0.95,
    "issuer": 0.95,
    "date": 0.90,
    "milestone_summary": 0.85,
    "skills_and_expertise": 0.85
  }
}

FIELD EXTRACTION RULES:
- milestone_type: MUST be one of: Promotion, Award, Recognition, Key Result, Achievement, Patent, Publication, Speaking Engagement
- issuer: Organization/company/entity giving recognition
- date: Format "Month Year" (e.g., "February 2024")
- milestone_summary: 1-2 sentences describing the achievement (be generic, factual)

CRITICAL SKILLS EXTRACTION FROM MILESTONES:
1. Extract skills that the milestone recognizes or demonstrates:
   - Award for "Best DeFi Project" → Extract: DeFi, Blockchain, Smart Contracts
   - "Promoted to Senior Engineer" → Look for department/team context
   - "Top Contributor Award" → Extract contribution area from description
   - "Employee of the Month" → Extract recognized skills from citation
2. Sources for skill extraction:
   a) Award title/name (e.g., "Excellence in React Development Award")
   b) Award description/citation
   c) Category/department (e.g., "Engineering Excellence Award" → technical skills)
   d) Issuing organization specialization
3. Proficiency inference:
   - Award/recognition typically implies "proficient" or "expert" level
   - Generic recognition (e.g., "Employee of Month") → "proficient"
   - Expert/leadership awards → "expert"
   - Participation/nominee → "working"
4. Category mapping:
   - Technical awards → extract specific technical/domain skills
   - Leadership awards → soft_skill category (Leadership, Management)
   - Community awards → soft_skill (Community Building, Mentorship)
   - Innovation awards → domain + methodology skills
5. Evidence from document:
   - Quote exact award title/description
   - Cite specific achievements mentioned
   - Reference issuer's focus area
6. DO NOT over-extract:
   - Generic "Employee Award" with no specifics → minimal or no skills
   - If award reason unclear → return empty array []
   - Avoid assumptions about unlisted skills
7. Confidence scoring:
   - 0.90+: Skill explicitly named in award title/description
   - 0.80-0.89: Skill clearly implied from award category
   - 0.70-0.79: Skill inferred from issuer specialization
   - <0.70: DO NOT include

GENERAL RULES:
- milestone_summary should be factual and generic
- Use null for fields not found
- If achievement is vague/generic, skills_and_expertise may be empty []
- NO markdown, NO explanations, raw JSON only`,

  contribution: `You are analyzing a community contribution document (open source PR, article, talk, tutorial, workshop, community role).

Extract ONLY information explicitly visible.

Return ONLY valid JSON with this exact structure:
{
  "contribution_type": "Article",
  "platform_name": "Medium",
  "date": "January 2024",
  "title": "Building Scalable DeFi Protocols on Solana",
  "url": "https://medium.com/@user/defi-solana-123",
  "skills_and_expertise": [
    {
      "name": "Solana",
      "category": "domain",
      "proficiency": "expert",
      "evidence": "Wrote comprehensive technical article explaining Solana DeFi architecture patterns",
      "confidence": 0.94
    },
    {
      "name": "DeFi",
      "category": "domain",
      "proficiency": "proficient",
      "evidence": "Article covers DeFi protocol design and best practices",
      "confidence": 0.92
    },
    {
      "name": "Technical Writing",
      "category": "soft_skill",
      "proficiency": "proficient",
      "evidence": "Published detailed technical article with code examples",
      "confidence": 0.88
    }
  ],
  "confidence": {
    "contribution_type": 0.95,
    "platform_name": 0.95,
    "date": 0.90,
    "title": 0.95,
    "url": 0.85,
    "skills_and_expertise": 0.90
  }
}

FIELD EXTRACTION RULES:
- contribution_type: MUST be one of: Talk, Article, Open Source, Community Role, Tutorial, Workshop, Video, Podcast, Mentorship
- platform_name: GitHub, Medium, Dev.to, YouTube, Twitter/X, Conference Name, Podcast Name, etc.
- date: Format "Month Year"
- title: Exact title of contribution
- url: Full URL if visible in document

CRITICAL SKILLS EXTRACTION FROM CONTRIBUTIONS:
1. Extract skills based on contribution type:
   
   A) TECHNICAL ARTICLES/TUTORIALS:
      - Extract technologies discussed in title
      - Extract frameworks/tools from content/code samples
      - Include "Technical Writing" as soft_skill
      - Proficiency: "expert" if teaching/explaining, "proficient" if overview
   
   B) OPEN SOURCE CONTRIBUTIONS:
      - Extract from PR/commit title and description
      - Check repository name/description for tech stack
      - Extract languages from file extensions if visible
      - Extract frameworks from context
      - Proficiency based on contribution type:
        * Major feature/refactor → "expert"
        * Bug fixes/improvements → "proficient"
        * Documentation/small fixes → "working"
   
   C) TALKS/PRESENTATIONS:
      - Extract from talk title and abstract
      - Include "Public Speaking" as soft_skill
      - Technologies mentioned are typically "proficient" or "expert"
   
   D) WORKSHOPS/TEACHING:
      - Extract technologies being taught
      - Include "Teaching" or "Mentorship" as soft_skill
      - Teaching implies "expert" level
   
   E) COMMUNITY ROLES:
      - Extract domain from community focus (e.g., "Rust Community Lead" → Rust)
      - Include relevant soft_skills: Leadership, Community Building
      - Proficiency typically "expert" for leadership roles

2. Category mapping:
   - language: If code/programming language is discussed
   - framework: If specific framework is topic
   - tool: If platform/tool is subject
   - domain: Broader topics (DeFi, Web3, AI, DevOps)
   - soft_skill: Writing, Speaking, Teaching, Community Building, Mentorship

3. Evidence examples:
   - "Article titled 'Advanced Rust Patterns' focuses on Rust programming"
   - "Merged PR #234 implementing GraphQL API in the backend"
   - "Gave talk at ReactConf 2024 on React Server Components"
   - "Published tutorial series on building Solana programs"

4. Confidence scoring:
   - 0.95+: Technology in title + detailed discussion
   - 0.85-0.94: Technology clearly central to contribution
   - 0.70-0.84: Technology mentioned/implied
   - <0.70: DO NOT include

5. Always include contribution-type-specific soft skill:
   - Article → Technical Writing (0.85-0.90 confidence)
   - Talk → Public Speaking (0.90+ confidence)
   - Tutorial → Teaching (0.88-0.92 confidence)
   - OSS → Open Source Contribution (0.90+ confidence)
   - Community Role → Community Leadership (0.90+ confidence)

GENERAL RULES:
- url field: Extract if visible, use null if not found
- Use null for other fields not found
- Be specific with skill extraction - avoid generic terms
- NO markdown, NO explanations, raw JSON only`
};

const VALID_PROOF_TYPES = Object.keys(PROMPTS);

module.exports = { PROMPTS, VALID_PROOF_TYPES };
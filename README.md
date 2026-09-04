# Resume Compass

Develop an AI Resume Builder that helps graduates, professionals, and career switchers create professional, ATS-friendly resumes with the assistance of AI.

The application should reduce the amount of time users spend creating and improving resumes by using AI to:

Generate professional resume summaries.

Improve work experience descriptions.

Generate and improve skills sections.

Provide ATS optimization suggestions.

Recommend improvements based on a target job.

Provide professional resume templates.

Generate a live resume preview.

Allow users to switch between templates.

Allow users to export/download their completed resume.

The project outline specifically identifies the target users as graduates, professionals, and career switchers, with features including AI suggestions, templates, ATS optimization, and export functionality.

2. TARGET USERS

Design the system primarily for:

A. University Graduates

Users with limited professional experience who need help presenting:

Education

Projects

Internships

Volunteer work

Skills

Certifications

Achievements

B. Working Professionals

Users who want to:

Improve an existing resume

Apply for new positions

Tailor their resume to specific jobs

Improve professional descriptions

Optimize their resume for ATS systems

C. Career Switchers

Users transitioning into a different career who need help:

Identifying transferable skills

Rewriting experience

Highlighting relevant achievements

Aligning their resume with a new career

3. CORE APPLICATION FEATURES

Build the application around the following major features.

Feature 1 — AI Resume Generator

Create a multi-step form where users enter:

Full name

Contact information

Professional title

Career objective

Education

Work experience

Projects

Skills

Certifications

Achievements

Volunteer experience

Target job title

Target industry

Job description

The AI should transform the user's information into professional resume content without inventing qualifications, employment history, degrees, certifications, or achievements.

4. AI PROFESSIONAL SUMMARY GENERATOR

Create an AI feature that generates a concise professional summary.

The AI should:

Analyze the user's information.

Identify their strongest qualifications.

Highlight relevant skills.

Consider their target position.

Use professional language.

Avoid generic clichés.

Keep the summary concise.

Never invent information.

Generate multiple versions where appropriate.

Example options:

Professional

Achievement-focused

Career-transition focused

5. AI WORK EXPERIENCE ENHANCER

Allow users to enter basic descriptions of their previous responsibilities.

Example:

"I helped customers and worked on computers."

The AI should transform this into professional resume language while preserving factual accuracy.

The AI should:

Use strong action verbs.

Emphasize responsibilities.

Highlight measurable achievements when the user provides measurements.

Improve grammar.

Remove unnecessary wording.

Avoid fabricating statistics.

For example, if the user did not provide a percentage improvement, the AI must NOT invent one.

6. AI SKILLS GENERATOR

Analyze the user's education, experience, projects, and target job.

Recommend relevant skills based ONLY on evidence supplied by the user.

Separate recommendations into:

Technical Skills

Examples:

Python

SQL

Java

Networking

Data Analysis

Soft Skills

Examples:

Communication

Teamwork

Problem Solving

Leadership

Clearly distinguish between:

Verified skills
and
Potential skills to consider

Do not falsely claim that the user possesses a skill.

7. ATS OPTIMIZATION

Create an ATS Resume Analyzer.

The user should be able to enter or paste a job description.

The AI should compare:

USER RESUME
versus
JOB DESCRIPTION

Then provide:

ATS compatibility score

Matching keywords

Missing keywords

Relevant skills

Suggested improvements

Sections requiring improvement

Recommendations for tailoring the resume

The system must clearly state that an ATS score is an estimate and not a guarantee that a particular employer's ATS will accept the resume.

8. AI JOB MATCH ANALYSIS

Add an optional feature that analyzes how well a user's resume aligns with a particular job description.

Output:

Match Score

Example:

78%

Strong Matches

Python

SQL

Data Analysis

Missing/Weak Areas

Cloud Computing

Power BI

Recommendations

Provide practical suggestions for improving alignment.

Never tell the user that they are guaranteed to get the job.

9. RESUME TEMPLATES

Create at least three professional templates:

Template 1 — Modern

Clean and contemporary design.

Template 2 — Professional

Traditional corporate layout.

Template 3 — Minimal ATS

Simple formatting optimized for readability and ATS compatibility.

Allow the user to switch between templates without losing their information.

10. LIVE RESUME PREVIEW

As users enter information and generate AI content, display a live resume preview.

The preview should update dynamically.

Include:

Name

Contact details

Professional summary

Skills

Work experience

Education

Projects

Certifications

Achievements

The interface should work on:

Desktop

Tablet

Mobile

The project outline specifically requires a dynamic resume preview, template switching, basic styling, and responsive design.

11. AI CHATBOT / ASSISTANT

Include an optional AI chatbot interface that acts as a career/resume assistant.

Users should be able to ask questions such as:

"How can I improve my resume?"

"What skills should I highlight for this position?"

"Rewrite my professional summary."

"Is this work experience description professional?"

"How can I make my resume more ATS-friendly?"

The chatbot should maintain context during the current resume-building session.

12. PROMPT ENGINEERING REQUIREMENTS

Prompt engineering is one of the most important assessment criteria.

Design prompts using a structured methodology:

ROLE

Tell the AI what role it should perform.

CONTEXT

Provide relevant user and job information.

TASK

Clearly describe what the AI must do.

CONSTRAINTS

Specify what the AI must and must not do.

OUTPUT FORMAT

Define exactly how the response should be structured.

QUALITY CRITERIA

Specify what makes a good response.

Use techniques such as:

Role prompting

Context injection

Few-shot examples where useful

Structured outputs

Constraints

Validation

Iterative prompt refinement

Document the prompts used in the application.

The project specifically requires designing, testing, and refining prompts and comparing outputs to improve accuracy.

13. MASTER RESUME GENERATION PROMPT

Create a high-quality internal prompt similar to the following structure:

"You are an expert professional resume writer and career assistant.

Your task is to generate professional, concise, ATS-friendly resume content using ONLY the information provided by the user.

USER INFORMATION:
{user_information}

TARGET JOB:
{target_job}

JOB DESCRIPTION:
{job_description}

Requirements:

Do not invent information.

Do not fabricate qualifications, achievements, employment history, certifications, or skills.

Improve grammar and professional wording.

Use strong action verbs.

Prioritize information relevant to the target position.

Keep content concise.

Maintain factual accuracy.

Identify missing information rather than guessing.

Avoid discriminatory or biased recommendations.

Produce professional language appropriate for employment applications.

Return the output in the following structure:

PROFESSIONAL SUMMARY:
...

KEY SKILLS:
...

WORK EXPERIENCE:
...

EDUCATION:
...

PROJECTS:
...

CERTIFICATIONS:
...

ACHIEVEMENTS:
...

ATS RECOMMENDATIONS:
...

MISSING INFORMATION:
...

QUALITY CHECK:
...
"

Improve this prompt during development through testing and comparison of outputs.

14. RESPONSIBLE AI

The application must include responsible AI safeguards.

The system should:

Inform users that AI-generated content should be reviewed.

Warn users that AI can produce inaccurate suggestions.

Never fabricate qualifications.

Avoid discriminatory recommendations.

Protect personal information.

Avoid making employment guarantees.

Clearly distinguish user-provided information from AI suggestions.

Encourage users to verify important information.

Include an appropriate disclaimer such as:

"AI-generated resume content is provided as a writing and optimization aid. Users are responsible for reviewing all generated content and ensuring that their resume accurately represents their qualifications, experience, skills, and achievements."

The project specifically requires identifying AI limitations, bias, and risks and implementing disclaimers and validation checks.

15. USER EXPERIENCE

Design the application to be simple enough for a first-time user.

Recommended workflow:

START
↓
Create Resume
↓
Enter Personal Information
↓
Enter Education
↓
Enter Experience
↓
Enter Skills
↓
Enter Projects
↓
Enter Target Job
↓
AI Generates Content
↓
Review AI Suggestions
↓
ATS Analysis
↓
Choose Template
↓
Preview Resume
↓
Edit
↓
Export Resume

Provide:

Clear navigation

Progress indicator

Loading states

Error messages

Success messages

Helpful instructions

Editable AI-generated content

Confirmation before exporting

16. TECHNICAL REQUIREMENTS

Build the prototype using modern web technologies.

Preferred stack:

Frontend:

HTML

CSS

JavaScript

Alternative:

React

Backend:

Python

AI:

OpenAI API / ChatGPT API or another suitable LLM API

Optional:

Flask or FastAPI

Storage:

Local storage for prototype
OR

MySQL for persistent storage

PDF:

PDF generation/export functionality

The architecture should separate:

User Interface

Application Logic

AI/Prompt Layer

Data Layer

Export Layer

17. DEVELOPMENT PLAN

Follow the five-day development structure from the project outline.

DAY 1 — RESEARCH & PLANNING

Produce:

Problem statement

Target users

User personas

Feature list

User journey

System workflow

Functional requirements

Non-functional requirements

Initial UI wireframe

Technical architecture

Expected result:

A clearly defined project scope, feature list, and user flow.

DAY 2 — DEVELOPMENT PHASE 1

Implement:

Project structure

User input forms

Basic UI

Resume data model

AI integration

Initial prompts

Professional summary generation

Experience enhancement

Skills generation

Expected result:

A working prototype containing input forms and AI prompt functionality.

DAY 3 — DEVELOPMENT PHASE 2

Implement:

AI response integration

Dynamic resume preview

Template switching

Responsive design

Resume editing

ATS analysis

Export functionality

Expected result:

A functional AI Resume Builder with live AI-generated content and preview.

DAY 4 — OPTIMIZATION & RESPONSIBLE AI

Test and improve:

Prompt accuracy

AI response quality

Professional tone

User experience

Navigation

Loading states

Error handling

AI limitations

Bias

Hallucination risks

Privacy

Validation

Disclaimers

Compare multiple prompt versions and explain why the final prompts perform better.

Expected result:

Improved AI quality, usability, and ethical safeguards.

DAY 5 — FINALIZATION & PRESENTATION

Prepare:

Final working prototype

Demonstration

Architecture diagram

Prompt engineering documentation

Responsible AI documentation

Testing results

Project documentation

Presentation slides

Demonstrate:

Creating a resume

Generating AI content

Improving work experience

Generating skills

ATS analysis

Switching templates

Editing content

Previewing the resume

Exporting the final resume

The final project should be presentation-ready.

18. TESTING

Create realistic test cases.

Test at least:

Test 1

Graduate with no work experience.

Test 2

Experienced IT professional.

Test 3

Career switcher.

Test 4

User with incomplete information.

Test 5

User with a detailed job description.

Test 6

User attempting to enter unsupported/fabricated information.

For each test document:

Input

Prompt

AI output

Expected output

Actual output

Problems identified

Prompt modification

Final result

19. EVALUATION STRATEGY

Optimize the project specifically around the assessment weighting:

CriterionWeightProblem Relevance20%Prompt Engineering25%Functionality25%Innovation15%Responsible AI10%Presentation5%

The final solution should therefore prioritize prompt quality and functional reliability, while still demonstrating innovation and responsible AI.

20. INNOVATION

To differentiate the application from a basic resume generator, consider implementing:

AI job-description matching

ATS keyword analysis

Transferable-skills identification

Resume quality score

Missing-information detection

Career-specific suggestions

Multiple resume versions

AI interview preparation

Job-specific resume tailoring

Explainable AI recommendations

Do not add unnecessary features if they compromise reliability or the five-day development timeline.

21. REQUIRED DOCUMENTATION

Create a 1–2 page project document containing:

Project title

Problem statement

Target users

Solution overview

Main features

Tools used

AI models/tools used

Prompt engineering strategy

Sample prompts

Responsible AI considerations

Challenges encountered

Solutions implemented

Expected impact

These align with the required project deliverables in the supplied outline.

22. PRESENTATION

Create a professional presentation covering:

Slide 1

Project title

Slide 2

Problem

Slide 3

Target users

Slide 4

Proposed solution

Slide 5

System features

Slide 6

How AI is used

Slide 7

Prompt engineering

Slide 8

Responsible AI

Slide 9

System demonstration

Slide 10

Impact and productivity improvement

Slide 11

Challenges and solutions

Slide 12

Future improvements

23. IMPORTANT DEVELOPMENT RULE

Do not simply create a visually attractive application.

The project must clearly demonstrate:

Problem → AI Solution → Prompt Engineering → Functional Output → Responsible AI → Measurable Productivity Value

Every feature should have a clear purpose.

When making design or development decisions, prioritize:

Functionality

AI output quality

Prompt engineering

User experience

Responsible AI

Innovation

Visual design

FINAL INSTRUCTION

Develop this project step-by-step.

Do not skip directly to the final application.

Start by producing:

A detailed problem statement

Target-user analysis

User personas

Functional requirements

Non-functional requirements

Complete feature list

User journey

System workflow

Technical architecture

Database/data structure

AI architecture

Prompt architecture

UI page structure

Five-day implementation plan

After completing the planning phase, proceed to the application design and development.

For every major AI feature, provide:

Purpose

Input

Prompt

AI processing

Expected output

Validation

Responsible AI considerations

Example test case

The final solution must be practical, professional, demonstrable, and directly aligned with the supplied AI Skill Accelerator Programme project requirements.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://career-craft-ai-973.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a683387-3a84-42dd-8800-08927bac4ac4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

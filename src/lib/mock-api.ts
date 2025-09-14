import { setupWorker } from 'msw/browser';
import { http, HttpResponse } from 'msw';
import { db, Job, Candidate, Assessment } from './database';

// Simulate network delays and errors
const simulateNetworkDelay = () => {
  return new Promise(resolve => {
    const delay = Math.random() * 1000 + 200; // 200-1200ms
    setTimeout(resolve, delay);
  });
};

const simulateError = () => {
  if (Math.random() < 0.08) { // 8% error rate
    throw new Error('Network error occurred');
  }
};

// Generate seed data
export const seedData = async () => {
  try {
    // Check if data already exists
    const existingJobs = await db.jobs.count();
    if (existingJobs > 0) return;

    console.log('🌱 Seeding database with initial data...');

    // Generate 25 jobs
    const jobs: Omit<Job, 'id'>[] = [
      {
        title: "Senior Frontend Developer",
        slug: "senior-frontend-developer",
        department: "Engineering",
        location: "San Francisco, CA",
        type: "Full-time",
        salary: "$120k - $160k",
        status: "active",
        applicants: 24,
        postedDate: "2024-01-15",
        order: 1,
        tags: ["React", "TypeScript", "Frontend"]
      },
      {
        title: "UX Designer",
        slug: "ux-designer",
        department: "Design",
        location: "New York, NY", 
        type: "Full-time",
        salary: "$90k - $120k",
        status: "active",
        applicants: 18,
        postedDate: "2024-01-12",
        order: 2,
        tags: ["Design", "Figma", "User Research"]
      },
      // Add more jobs...
      ...Array.from({ length: 23 }, (_, i) => ({
        title: `Job Title ${i + 3}`,
        slug: `job-title-${i + 3}`,
        department: ["Engineering", "Design", "Product", "Marketing", "Sales"][Math.floor(Math.random() * 5)],
        location: ["Remote", "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA"][Math.floor(Math.random() * 5)],
        type: ["Full-time", "Part-time", "Contract"][Math.floor(Math.random() * 3)] as Job['type'],
        salary: `$${60 + Math.floor(Math.random() * 100)}k - $${100 + Math.floor(Math.random() * 100)}k`,
        status: Math.random() > 0.3 ? "active" : "archived" as Job['status'],
        applicants: Math.floor(Math.random() * 50),
        postedDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
        order: i + 3,
        tags: ["React", "TypeScript", "Python", "Design", "Marketing", "Sales"].slice(0, Math.floor(Math.random() * 3) + 1)
      }))
    ];

    // Generate 1000 candidates  
    const candidates: Omit<Candidate, 'id'>[] = Array.from({ length: 1000 }, (_, i) => ({
      name: `Candidate ${i + 1}`,
      email: `candidate${i + 1}@email.com`,
      phone: `+1 (555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      position: jobs[Math.floor(Math.random() * jobs.length)].title,
      stage: ["applied", "screened", "technical", "offer", "hired", "rejected"][Math.floor(Math.random() * 6)] as Candidate['stage'],
      appliedDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toISOString().split('T')[0],
      location: ["San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Remote"][Math.floor(Math.random() * 5)],
      timeline: []
    }));

    // Generate 3 assessments
    const assessments: Omit<Assessment, 'id'>[] = [
      {
        title: "Frontend Developer Technical Assessment",
        description: "Comprehensive evaluation of React, TypeScript, and modern frontend development skills",
        status: "published",
        responses: 45,
        createdDate: "2024-01-10",
        lastUpdated: "2024-01-15",
        sections: [
          {
            id: "section-1",
            title: "Technical Knowledge",
            description: "Core frontend development concepts",
            order: 1,
            questions: [
              {
                id: "q1",
                type: "single-choice",
                title: "What is the purpose of React hooks?",
                required: true,
                options: [
                  "To manage state in functional components",
                  "To create class components",
                  "To style components",
                  "To handle routing"
                ],
                order: 1
              },
              {
                id: "q2", 
                type: "multi-choice",
                title: "Which of the following are valid TypeScript types?",
                required: true,
                options: ["string", "number", "boolean", "undefined", "symbol"],
                order: 2
              },
              {
                id: "q3",
                type: "long-text",
                title: "Explain the difference between `useEffect` and `useLayoutEffect`",
                required: true,
                validation: { minLength: 50, maxLength: 500 },
                order: 3
              }
            ]
          }
        ]
      },
      {
        title: "UX Design Portfolio Review",
        description: "Design thinking, user research, and prototyping skills evaluation",
        status: "published", 
        responses: 23,
        createdDate: "2024-01-08",
        lastUpdated: "2024-01-12",
        sections: [
          {
            id: "section-1",
            title: "Design Process",
            order: 1,
            questions: [
              {
                id: "q1",
                type: "single-choice", 
                title: "What is the first step in the design thinking process?",
                required: true,
                options: ["Empathize", "Define", "Ideate", "Prototype"],
                order: 1
              }
            ]
          }
        ]
      },
      {
        title: "Product Management Case Study",
        description: "Strategic thinking and product roadmap planning assessment",
        status: "draft",
        responses: 0,
        createdDate: "2024-01-16",
        lastUpdated: "2024-01-16", 
        sections: [
          {
            id: "section-1",
            title: "Strategic Thinking",
            order: 1,
            questions: [
              {
                id: "q1",
                type: "long-text",
                title: "How would you prioritize features for a new product launch?",
                required: true,
                validation: { minLength: 100, maxLength: 1000 },
                order: 1
              }
            ]
          }
        ]
      }
    ];

    await db.jobs.bulkAdd(jobs);
    await db.candidates.bulkAdd(candidates);
    await db.assessments.bulkAdd(assessments);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Mock API handlers
export const handlers = [
  // Jobs endpoints
  http.get('/api/jobs', async ({ request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    
    let query = db.jobs.orderBy('order');
    
    if (status && status !== 'all') {
      query = query.filter(job => job.status === status);
    }
    
    const jobs = await query.toArray();
    
    let filteredJobs = jobs;
    if (search) {
      filteredJobs = jobs.filter(job => 
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.department.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedJobs = filteredJobs.slice(start, end);
    
    return HttpResponse.json({
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit)
      }
    });
  }),

  http.get('/api/jobs/:id', async ({ params }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    const job = await db.jobs.get(parseInt(id as string));
    
    if (!job) {
      return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    return HttpResponse.json(job);
  }),

  http.post('/api/jobs', async ({ request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const jobData = await request.json() as Partial<Job>;
    const newJob = await db.jobs.add(jobData as Job);
    
    return HttpResponse.json({ id: newJob, ...jobData }, { status: 201 });
  }),

  http.put('/api/jobs/:id', async ({ params, request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    const updates = await request.json() as Partial<Job>;
    
    await db.jobs.update(parseInt(id as string), updates);
    const updatedJob = await db.jobs.get(parseInt(id as string));
    
    return HttpResponse.json(updatedJob);
  }),

  http.delete('/api/jobs/:id', async ({ params }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    await db.jobs.delete(parseInt(id as string));
    
    return new HttpResponse(null, { status: 204 });
  }),

  // Candidates endpoints
  http.get('/api/candidates', async ({ request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const stage = url.searchParams.get('stage');
    const search = url.searchParams.get('search');
    
    let candidates = await db.candidates.orderBy('appliedDate').reverse().toArray();
    
    if (stage && stage !== 'all') {
      candidates = candidates.filter(candidate => candidate.stage === stage);
    }
    
    if (search) {
      candidates = candidates.filter(candidate => 
        candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        candidate.email.toLowerCase().includes(search.toLowerCase()) ||
        candidate.position.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCandidates = candidates.slice(start, end);
    
    return HttpResponse.json({
      data: paginatedCandidates,
      pagination: {
        page,
        limit,
        total: candidates.length,
        totalPages: Math.ceil(candidates.length / limit)
      }
    });
  }),

  http.get('/api/candidates/:id', async ({ params }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    const candidate = await db.candidates.get(parseInt(id as string));
    
    if (!candidate) {
      return HttpResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }
    
    return HttpResponse.json(candidate);
  }),

  // Assessments endpoints
  http.get('/api/assessments', async () => {
    await simulateNetworkDelay();
    simulateError();
    
    const assessments = await db.assessments.orderBy('lastUpdated').reverse().toArray();
    return HttpResponse.json({ data: assessments });
  }),

  http.get('/api/assessments/:id', async ({ params }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    const assessment = await db.assessments.get(parseInt(id as string));
    
    if (!assessment) {
      return HttpResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    
    return HttpResponse.json(assessment);
  }),

  http.post('/api/assessments', async ({ request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const assessmentData = await request.json() as Partial<Assessment>;
    const newAssessment = await db.assessments.add({
      ...assessmentData,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      responses: 0,
      status: 'draft'
    } as Assessment);
    
    return HttpResponse.json({ id: newAssessment, ...assessmentData }, { status: 201 });
  }),

  http.put('/api/assessments/:id', async ({ params, request }) => {
    await simulateNetworkDelay();
    simulateError();
    
    const { id } = params;
    const updates = await request.json() as Partial<Assessment>;
    
    await db.assessments.update(parseInt(id as string), {
      ...updates,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
    const updatedAssessment = await db.assessments.get(parseInt(id as string));
    
    return HttpResponse.json(updatedAssessment);
  }),
];

export const worker = setupWorker(...handlers);
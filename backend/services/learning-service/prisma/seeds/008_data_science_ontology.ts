import { PrismaClient } from '@prisma/client';

interface NodeDef {
  title: string;
  slug: string;
  description: string;
  learningOutcomes: string[];
  estimatedHours: number;
  difficultyLevel: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  prereqs: string[];
}

const NODES: NodeDef[] = [
  {
    title: 'Python Fundamentals',
    slug: 'ds-python-fundamentals',
    description: 'Core Python programming — syntax, data types, control flow, functions, and modules.',
    learningOutcomes: [
      'Write Python scripts with variables, loops, and conditionals',
      'Define and call functions with parameters and return values',
      'Use built-in data structures: lists, dicts, tuples, sets',
      'Import and use standard library modules',
    ],
    estimatedHours: 12,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Git & Version Control',
    slug: 'ds-git',
    description: 'Track code changes and collaborate using Git and GitHub.',
    learningOutcomes: [
      'Initialize repos, stage, and commit changes',
      'Create and merge branches',
      'Use pull requests on GitHub',
      'Maintain reproducible project histories',
    ],
    estimatedHours: 4,
    difficultyLevel: 1,
    prereqs: [],
  },
  {
    title: 'Math for Data Science',
    slug: 'ds-math',
    description: 'Linear algebra, calculus intuition, probability, and statistics foundations for ML.',
    learningOutcomes: [
      'Perform matrix and vector operations',
      'Understand gradients and partial derivatives conceptually',
      'Apply probability distributions and Bayes theorem',
      'Compute and interpret descriptive statistics',
    ],
    estimatedHours: 14,
    difficultyLevel: 2,
    prereqs: [],
  },
  {
    title: 'NumPy & Pandas',
    slug: 'ds-numpy-pandas',
    description: 'Numerical computing with NumPy arrays and data manipulation with Pandas DataFrames.',
    learningOutcomes: [
      'Create and manipulate NumPy arrays and perform vectorized operations',
      'Load, clean, and transform data with Pandas',
      'Filter, group, aggregate, and merge DataFrames',
      'Handle missing values and outliers',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['ds-python-fundamentals'],
  },
  {
    title: 'Data Visualization',
    slug: 'ds-visualization',
    description: 'Create informative charts and dashboards with Matplotlib, Seaborn, and Plotly.',
    learningOutcomes: [
      'Build line, bar, scatter, histogram, and heatmap plots',
      'Customize plots with labels, titles, and colour palettes',
      'Create interactive visualizations with Plotly',
      'Choose the right chart type for each data question',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['ds-numpy-pandas'],
  },
  {
    title: 'Exploratory Data Analysis',
    slug: 'ds-eda',
    description: 'Systematically explore datasets to uncover patterns, anomalies, and hypotheses.',
    learningOutcomes: [
      'Profile a dataset: shape, types, nulls, duplicates',
      'Identify distributions and correlations',
      'Generate and test hypotheses from data',
      'Document findings clearly with notebooks',
    ],
    estimatedHours: 8,
    difficultyLevel: 2,
    prereqs: ['ds-numpy-pandas', 'ds-visualization'],
  },
  {
    title: 'SQL for Data Analysis',
    slug: 'ds-sql',
    description: 'Query relational databases to extract and aggregate data for analysis.',
    learningOutcomes: [
      'Write SELECT, WHERE, GROUP BY, and ORDER BY queries',
      'JOIN multiple tables and use subqueries',
      'Use window functions (ROW_NUMBER, LAG, LEAD)',
      'Optimize queries with indexes and EXPLAIN',
    ],
    estimatedHours: 10,
    difficultyLevel: 2,
    prereqs: ['ds-python-fundamentals'],
  },
  {
    title: 'Statistics & Hypothesis Testing',
    slug: 'ds-statistics',
    description: 'Apply inferential statistics, A/B testing, and confidence intervals to real data.',
    learningOutcomes: [
      'Formulate and test null/alternative hypotheses',
      'Apply t-tests, chi-square, and ANOVA',
      'Calculate confidence intervals and p-values',
      'Design valid A/B experiments',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['ds-math', 'ds-eda'],
  },
  {
    title: 'Scikit-learn & ML Workflow',
    slug: 'ds-sklearn-workflow',
    description: 'End-to-end machine learning pipeline using scikit-learn: preprocessing, training, and evaluation.',
    learningOutcomes: [
      'Split data into train/validation/test sets',
      'Apply StandardScaler, OneHotEncoder, and pipelines',
      'Train and evaluate models with cross-validation',
      'Interpret confusion matrices, ROC-AUC, and RMSE',
    ],
    estimatedHours: 12,
    difficultyLevel: 3,
    prereqs: ['ds-numpy-pandas', 'ds-statistics'],
  },
  {
    title: 'Supervised Learning — Regression',
    slug: 'ds-regression',
    description: 'Predict continuous values with linear regression, Ridge, Lasso, and tree-based regressors.',
    learningOutcomes: [
      'Fit linear regression and interpret coefficients',
      'Apply Ridge and Lasso regularization',
      'Train Decision Tree and Random Forest regressors',
      'Diagnose underfitting and overfitting',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['ds-sklearn-workflow'],
  },
  {
    title: 'Supervised Learning — Classification',
    slug: 'ds-classification',
    description: 'Classify examples with logistic regression, SVMs, and ensemble methods.',
    learningOutcomes: [
      'Train logistic regression and interpret log-odds',
      'Apply SVM with RBF kernel',
      'Build Random Forest and Gradient Boosting classifiers',
      'Handle class imbalance with SMOTE and class weights',
    ],
    estimatedHours: 10,
    difficultyLevel: 3,
    prereqs: ['ds-sklearn-workflow'],
  },
  {
    title: 'Unsupervised Learning',
    slug: 'ds-unsupervised',
    description: 'Discover structure in unlabelled data with clustering and dimensionality reduction.',
    learningOutcomes: [
      'Cluster data with K-Means and DBSCAN',
      'Evaluate clusters with silhouette score',
      'Reduce dimensions with PCA and t-SNE',
      'Apply association rules for market basket analysis',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['ds-sklearn-workflow'],
  },
  {
    title: 'Feature Engineering',
    slug: 'ds-feature-engineering',
    description: 'Transform raw data into informative features that improve model performance.',
    learningOutcomes: [
      'Create interaction and polynomial features',
      'Encode categorical variables effectively',
      'Handle temporal features from datetime columns',
      'Select features with importance scores and RFE',
    ],
    estimatedHours: 8,
    difficultyLevel: 3,
    prereqs: ['ds-regression', 'ds-classification'],
  },
  {
    title: 'Model Selection & Hyperparameter Tuning',
    slug: 'ds-model-tuning',
    description: 'Choose the best model and optimize hyperparameters with systematic search strategies.',
    learningOutcomes: [
      'Compare models with cross-validated metrics',
      'Tune hyperparameters with GridSearchCV and RandomizedSearchCV',
      'Use Optuna for Bayesian hyperparameter optimization',
      'Avoid data leakage in the tuning pipeline',
    ],
    estimatedHours: 8,
    difficultyLevel: 4,
    prereqs: ['ds-feature-engineering'],
  },
  {
    title: 'Deep Learning with PyTorch',
    slug: 'ds-deep-learning',
    description: 'Build and train neural networks with PyTorch for tabular, image, and text tasks.',
    learningOutcomes: [
      'Define feedforward networks with nn.Module',
      'Train with SGD and Adam optimizers',
      'Apply batch normalization and dropout',
      'Debug with loss curves and gradient checks',
    ],
    estimatedHours: 16,
    difficultyLevel: 4,
    prereqs: ['ds-model-tuning'],
    isBranchingPoint: true,
  },
  {
    title: 'Computer Vision',
    slug: 'ds-cv',
    description: 'Classify images and detect objects with CNNs and transfer learning.',
    learningOutcomes: [
      'Build and train CNNs with convolutional and pooling layers',
      'Apply transfer learning with ResNet and EfficientNet',
      'Fine-tune pretrained models on custom datasets',
      'Evaluate with mAP and IoU for detection tasks',
    ],
    estimatedHours: 14,
    difficultyLevel: 4,
    prereqs: ['ds-deep-learning'],
  },
  {
    title: 'Natural Language Processing',
    slug: 'ds-nlp',
    description: 'Process and model text with tokenization, embeddings, and transformer fine-tuning.',
    learningOutcomes: [
      'Tokenize and vectorize text with TF-IDF and word2vec',
      'Fine-tune BERT for classification and NER',
      'Build text generation pipelines with HuggingFace',
      'Evaluate NLP models with BLEU, F1, and perplexity',
    ],
    estimatedHours: 14,
    difficultyLevel: 4,
    prereqs: ['ds-deep-learning'],
  },
  {
    title: 'Time Series Analysis',
    slug: 'ds-time-series',
    description: 'Forecast and analyze sequential data with statistical and ML methods.',
    learningOutcomes: [
      'Decompose time series into trend, seasonality, and residual',
      'Fit ARIMA and SARIMA models',
      'Apply Prophet for business forecasting',
      'Build LSTM-based sequence models',
    ],
    estimatedHours: 12,
    difficultyLevel: 4,
    prereqs: ['ds-deep-learning'],
  },
  {
    title: 'MLOps & Model Deployment',
    slug: 'ds-mlops',
    description: 'Package, serve, monitor, and version ML models in production.',
    learningOutcomes: [
      'Serve models as REST APIs with FastAPI',
      'Containerize ML services with Docker',
      'Track experiments with MLflow',
      'Monitor model drift and data quality in production',
    ],
    estimatedHours: 12,
    difficultyLevel: 4,
    isConvergencePoint: true,
    prereqs: ['ds-cv', 'ds-nlp', 'ds-time-series'],
  },
];

export async function seedDataScienceOntology(prisma: PrismaClient) {
  const domain = await prisma.domain.findUnique({ where: { slug: 'data-science' } });
  if (!domain) throw new Error('Domain data-science not found — run 001_domains first');

  const admin = await prisma.user.upsert({
    where: { email: 'seed-admin@system.internal' },
    update: {},
    create: {
      email: 'seed-admin@system.internal',
      fullName: 'System Seed',
      role: 'admin',
      passwordHash: null,
    },
  });

  const existing = await prisma.ontologyVersion.findFirst({
    where: { domainId: domain.id, versionNumber: 1 },
  });
  if (existing) {
    console.log('Data Science ontology v1 already seeded — skipping');
    return;
  }

  const version = await prisma.ontologyVersion.create({
    data: {
      domainId: domain.id,
      versionNumber: 1,
      status: 'draft',
      createdById: admin.id,
    },
  });

  const slugToId = new Map<string, string>();

  for (const nodeDef of NODES) {
    const { prereqs, ...fields } = nodeDef;
    const node = await prisma.learningNode.create({
      data: {
        ...fields,
        ontologyVersionId: version.id,
        learningOutcomes: fields.learningOutcomes,
        estimatedHours: fields.estimatedHours,
      },
    });
    slugToId.set(nodeDef.slug, node.id);
  }

  let edgeCount = 0;
  for (const nodeDef of NODES) {
    const nodeId = slugToId.get(nodeDef.slug)!;
    for (const prereqSlug of nodeDef.prereqs) {
      const prereqId = slugToId.get(prereqSlug);
      if (!prereqId) throw new Error(`Unknown prereq slug: ${prereqSlug}`);
      await prisma.nodePrerequisite.create({
        data: { nodeId, prerequisiteNodeId: prereqId },
      });
      edgeCount++;
    }
  }

  await prisma.ontologyVersion.update({
    where: { id: version.id },
    data: { status: 'published', publishedAt: new Date() },
  });

  console.log(`Seeded Data Science ontology v1: ${NODES.length} nodes, ${edgeCount} edges (published)`);
}

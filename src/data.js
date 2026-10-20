// Todo o conteúdo do CV fica aqui, em inglês e português: T('english', 'português').
import { T } from './i18n.js';

export const PROFILE = {
  name: 'Fábio Demo da Rosa',
  short: 'Fábio',
  role: 'Senior Data Engineer',
  focus: 'Data Platform · Lakehouse · Databricks',
  location: T('Santa Maria, RS, Brazil', 'Santa Maria, RS, Brasil'),
  github: 'https://github.com/fabiodemo',
  linkedin: 'https://www.linkedin.com/in/fabiodemo',
  // Preencha para aparecer no site. Vazio = escondido.
  email: '',
  summary: T(
    'Senior Data Engineer with 5+ years in data and ML, on a DataOps team. I build and run the Databricks lakehouse behind an investment platform: ingestion pipelines (brokerage, market, CRM, finance), the Terraform platform they run on, and the governance and data quality rules that keep personal data masked by default. Multi-cloud day to day (AWS and OCI, plus Azure and GCP). I came from industrial IoT and analytics, and hold an M.Sc. in Computer Science with published research on Deep Reinforcement Learning for robot navigation.',
    'Senior Data Engineer com mais de 5 anos em dados e ML, em um time de DataOps. Construo e opero o lakehouse Databricks por trás de uma plataforma de investimentos: pipelines de ingestão (brokerage, mercado, CRM, finanças), a plataforma em Terraform onde eles rodam e as regras de governança e data quality que mantêm dado pessoal mascarado por padrão. Multi-cloud no dia a dia (AWS e OCI, além de Azure e GCP). Venho de IoT industrial e analytics, e tenho mestrado em Ciência da Computação com pesquisa publicada em Deep Reinforcement Learning para navegação de robôs.',
  ),
  about: T(
    'Drawn to data-intensive systems where scale, latency and correctness trade-offs actually matter. I follow the open-source ecosystem closely and run Fedora and Arch Linux at home (macOS on an M4 at work), which keeps me honest about what happens under the abstractions.',
    'Gosto de sistemas data-intensive, onde trade-offs de escala, latência e corretude importam de verdade. Acompanho de perto o ecossistema open source e uso Fedora e Arch Linux em casa (macOS num M4 no trabalho), o que me mantém honesto sobre o que acontece por baixo das abstrações.',
  ),
};

export const LANGUAGES = [
  { n: T('Portuguese', 'Português'), lv: T('Native', 'Nativo'), p: 100 },
  { n: T('English', 'Inglês'), lv: T('Full professional', 'Profissional completo'), p: 85 },
  { n: T('Spanish', 'Espanhol'), lv: T('Elementary', 'Básico'), note: T('follows work meetings with Argentine colleagues', 'acompanha reuniões de trabalho com colegas argentinos'), p: 35 },
];

export const STATS = [
  { k: '8,302', kp: '8.302', v: T('commits across 5 repos', 'commits em 5 repos') },
  { k: '859', v: T('feature PRs', 'PRs de feature') },
  { k: '154', v: T('pipelines touched', 'pipelines tocados') },
  { k: '1,000+', kp: '1.000+', v: T('tickets closed', 'tickets fechados') },
  { k: 'US$2-4k/mo', kp: 'US$2-4k/mês', v: T('estimated cloud savings', 'economia estimada em cloud') },
  { k: '12-19h → ≤3h', v: T('core portfolio pipeline', 'pipeline core de portfólio') },
].map((s) => ({ ...s, k: T(s.k, s.kp || s.k) }));

export const EXPERIENCE = [
  {
    id: 'warren',
    company: 'Warren Investimentos',
    title: 'Data Engineer → Senior Data Engineer',
    when: T('Jul 2024 - Present', 'jul/2024 - atual'),
    place: T('Porto Alegre, RS · Remote', 'Porto Alegre, RS · Remoto'),
    roles: [
      ['Senior Data Engineer', T('Feb 2026 - Present', 'fev/2026 - atual')],
      ['Data Engineer', T('Jul 2024 - Feb 2026', 'jul/2024 - fev/2026')],
    ],
    resume: [0, 2, 1, 11, 12, 7, 8, 3, 9, 13],
    note: T(
      'Investment fintech, DataOps team. Promoted to Senior in Feb 2026.',
      'Fintech de investimentos, time de DataOps. Promovido a Sênior em fev/2026.',
    ),
    stack: ['Databricks', 'PySpark', 'Delta Lake', 'Unity Catalog', 'AWS DMS', 'Terraform', 'OCI', 'dbt', 'DQX', 'Great Expectations', 'GitHub Actions'],
    bullets: [
      T('Redesigned the core portfolio pipeline with AWS DMS and a D-1 processing queue: daily PortfolioReturns from 12-19h to ≤3h, Positions from 10-12h to 1-2h, and weekly loads became daily.',
        'Redesenhou o pipeline core de portfólio com AWS DMS e fila de processamento D-1: PortfolioReturns diário de 12-19h para ≤3h, Positions de 10-12h para 1-2h, e cargas semanais viraram diárias.'),
      T('Led the ingestion re-architecture for the AWS → OCI migration (OCI Data Integration) with zero pipeline downtime; Core pipelines went from 5-7h to ~1h45 with 40 tables moved.',
        'Liderou a re-arquitetura de ingestão na migração AWS → OCI (OCI Data Integration) sem downtime de pipeline; pipelines Core de 5-7h para ~1h45 e 40 tabelas migradas.'),
      T('Ran the FinOps work behind an AWS bill that went from ~US$7k to ~US$3k a month (estimated US$2-4k/mo saved): broke up heavy pipelines on a DMS + single-node standard (Fees: -80% AWS, -62% Databricks), moved 9 DynamoDB tables to on-demand (US$105 → ~US$5/mo), traced and stopped a data-sharing egress spike, and reviewed the storage cleanup (Glacier tiering, unused buckets).',
        'Tocou o FinOps por trás de uma fatura AWS que caiu de ~US$7k para ~US$3k por mês (economia estimada de US$2-4k/mês): quebrou pipelines pesados num padrão DMS + single node (Fees: -80% AWS, -62% Databricks), passou 9 tabelas DynamoDB para on-demand (US$105 → ~US$5/mês), rastreou e cortou um pico de egress de data sharing, e revisou a limpeza de storage (Glacier, buckets sem uso).'),
      T('Moved pipelines and users off the legacy Datalake to Delta Lake + Unity Catalog (a UCX assessment found 9,574 legacy table uses) and shut the old workspace down in Jun 2026 with a Terraform backup.',
        'Migrou pipelines e usuários do Datalake legado para Delta Lake + Unity Catalog (assessment UCX com 9.574 usos de tabelas legadas) e desligou o workspace antigo em jun/2026 com backup em Terraform.'),
      T('Built the trading desks\' near-real-time cash-management feed (Projeto Ganesha): 6 sources (Sinacor, B3, TED/PIX, fixed income, funds, internal API) refreshed every 5 minutes behind a monitoring dashboard.',
        'Construiu o feed de cash management near-real-time das mesas (Projeto Ganesha): 6 fontes (Sinacor, B3, TED/PIX, renda fixa, fundos e API interna) atualizadas a cada 5 min com dashboard de monitoramento.'),
      T('Sped up the Sinacor (Oracle) back-office ingestion on DMS: heavy tasks from >3h to 15-16 min; historic table from 120 to 12 columns and from >3h to ~40 min; Sinacor API 66% faster.',
        'Otimizou a ingestão do Sinacor (Oracle) no DMS: tasks pesadas de >3h para 15-16 min; tabela histórica de 120 para 12 colunas, de >3h para ~40 min; API do Sinacor 66% mais rápida.'),
      T('Refactored a MongoDB pipeline to incremental JDBC upserts (4h → 5 min, 98%) and replaced pandas ingestion with distributed Spark reads in high-volume pipelines.',
        'Refatorou um pipeline MongoDB para upserts incrementais via JDBC (4h → 5 min, 98%) e trocou ingestão em pandas por leituras distribuídas em Spark nos pipelines de alto volume.'),
      T('Implemented governance as code in Terraform (640+ commits on grants and views, 220+ access tickets), from new-workspace provisioning (KMS, S3 and IAM policies) to ABAC, column masks, dynamic views, Data Classification, governed tags and SSO, plus a credential audit, the Security Analysis Tool and data contracts across Bronze/Silver in Unity Catalog.',
        'Implementou governança como código em Terraform (640+ commits em grants e views, 220+ tickets de acesso), do provisionamento de novos workspaces (políticas de KMS, S3 e IAM) a ABAC, column masks, dynamic views, Data Classification, governed tags e SSO, além de auditoria de credenciais, Security Analysis Tool e data contracts em Bronze/Silver no Unity Catalog.'),
      T('Owned Silver-layer data quality: revived a dbt + Elementary repository stalled for two years, retired 79% of obsolete sources and restored production test coverage, then added Great Expectations and DQX checks for integrity, volume and business rules, with Slack alerts.',
        'Responsável pelo data quality da camada Silver: revitalizou um repositório dbt + Elementary parado havia dois anos, eliminou 79% das fontes obsoletas e restabeleceu a cobertura de testes em produção, depois somou checks de Great Expectations e DQX para integridade, volume e regras de negócio, com alertas no Slack.'),
      T('Shipped a reverse ETL from the lakehouse to HubSpot in Spark with per-row hash diffs (only changed records go out), batch endpoints, threads and async calls, syncing 1.7M contacts; replaced Lambda polling with EventBridge schedules.',
        'Entregou reverse ETL do lakehouse para o HubSpot em Spark com hash por linha (só sai o que mudou), endpoints em batch, threads e chamadas async, sincronizando 1,7M de contatos; trocou polling em Lambda por agendamentos no EventBridge.'),
      T('Rebuilt the company\'s whole Jira history as governed tables: 575k issues and 941k comments streamed from 27 GB of XML in 4 min; a PII scan first showed sensitive values in free text, so every free-text field is hashed, behind 1 sensitive table and 53 masked views.',
        'Reconstruiu o histórico inteiro do Jira da empresa como tabelas governadas: 575k issues e 941k comentários processados de 27 GB de XML em 4 min; um scan de PII antes mostrou dado sensível em texto livre, então todo campo de texto livre é hasheado, atrás de 1 tabela sensitive e 53 views mascaradas.'),
      T('Built the Data Science team\'s path to production on Databricks: dev/stg/prd catalogs, buckets and a dedicated cluster as code, MLOps Stacks as the project template, MLflow, and GitHub Actions deploying ML projects through Asset Bundles; structured the churn pipeline on it (extraction, feature engineering, batch inference with time-based validation).',
        'Construiu o caminho para produção do time de Data Science no Databricks: catálogos, buckets e cluster dedicado em dev/stg/prd como código, MLOps Stacks como template, MLflow e GitHub Actions publicando projetos de ML via Asset Bundles; estruturou nele o pipeline de churn (extração, feature engineering, inferência em batch com validação temporal).'),
      T('Rolled out Databricks Genie company-wide on the same Unity Catalog grants and PII masks, with docs, usage reviews and a US$9 per-user cap that kept it inside the free tier; implemented Mosaic AI Vector Search over NPS data and shipped a Databricks App for banking analytics (React + TypeScript, 25 SQL queries).',
        'Levou o Databricks Genie para a empresa toda sobre os mesmos grants e masks de PII do Unity Catalog, com documentação, revisões de uso e teto de US$9 por usuário que manteve tudo no free tier; implementou Vector Search no Mosaic AI sobre dados de NPS e entregou um Databricks App de analytics bancário (React + TypeScript, 25 queries SQL).'),
      T('Raised the team: started a weekly Knowledge Exchange (30+ Databricks features shared as they shipped), built a DataOps bot for automated KPI reports, moved planning to weekly cycles and added AI coding assistant instructions (CLAUDE.md, AGENTS.md, Copilot) to every repo.',
        'Puxou o time junto: criou um Knowledge Exchange semanal (30+ features do Databricks compartilhadas no lançamento), um bot de DataOps para relatórios automáticos de KPI, levou o planejamento para ciclos semanais e colocou instruções para assistentes de código (CLAUDE.md, AGENTS.md, Copilot) em todos os repos.'),
    ],
  },
  {
    id: 'grey',
    company: 'GreyLogix Brasil',
    title: 'Data Analyst → Data Engineer',
    when: T('Feb 2021 - Aug 2024', 'fev/2021 - ago/2024'),
    place: 'Florianópolis, SC',
    roles: [
      ['Data Engineer', T('Sep 2021 - Aug 2024', 'set/2021 - ago/2024')],
      ['Data Analyst', T('Feb 2021 - Sep 2021', 'fev/2021 - set/2021')],
    ],
    resume: [0, 1, 7, 2, 3, 5],
    note: T(
      'Industrial automation and data integrator. Started as a Data Analyst, moved to Data Engineer and ended up running data, cloud and edge for several industrial clients at once. Path: analytics → industrial IoT → data engineering → platform/edge.',
      'Integradora de automação industrial e dados. Entrei como Data Analyst, virei Data Engineer e saí cuidando de dados, cloud e edge para vários clientes industriais ao mesmo tempo. Trajetória: analytics → IoT industrial → data engineering → plataforma/edge.',
    ),
    stack: ['Python', 'GCP (BigQuery, Dataflow, Pub/Sub, Composer)', 'Airflow', 'dbt', 'Kafka', 'SQL Server', 'PostgreSQL', 'Oracle', 'InfluxDB', 'Docker', 'Kubernetes', 'Terraform', 'Node-RED', 'MQTT', 'OPC UA', 'WinCC', 'Mendix', 'Power BI', 'Grafana', 'Streamlit', 'Flask'],
    stats: [
      { k: T('3.5 yrs', '3,5 anos'), v: T('Feb 2021 to Aug 2024', 'de fev/2021 a ago/2024') },
      { k: '10+', v: T('industrial clients', 'clientes industriais') },
      { k: T('1st', '1ª'), v: T('GenAI initiative at the company (Ollama + CrewAI)', 'iniciativa de GenAI da empresa (Ollama + CrewAI)') },
      { k: '2', v: T('roles: Data Analyst → Data Engineer', 'cargos: Data Analyst → Data Engineer') },
    ],
    clients: ['Hydac', 'Gerdau', 'Usina São Luiz', 'CVale', 'Umicore', 'Fey', 'Café Iguaçu', 'QBEE', 'Projedata', 'Ibero', 'Viposa'],
    bullets: [
      T('Turned raw industrial instrument data (sensors, PLCs) into harmonized datasets over MQTT, OPC UA and Node-RED for 10+ clients.',
        'Transformou dados brutos de instrumentos industriais (sensores, CLPs) em datasets harmonizados via MQTT, OPC UA e Node-RED para mais de 10 clientes.'),
      T('Designed a near-real-time pipeline for industrial clients: Pub/Sub ingestion, micro-batch processing on GCP and containerized Python enrichment into InfluxDB.',
        'Desenhou e construiu um pipeline near-real-time para clientes industriais: ingestão em Pub/Sub, micro-batch na GCP e enriquecimento em Python containerizado gravando no InfluxDB.'),
      T('Delivered GCP data engineering with BigQuery, Dataflow and Cloud Composer (Airflow), plus a Data Warehouse + Data Lake (D4ALL project) with dbt, PostgreSQL and SQL Server.',
        'Entregou data engineering na GCP com BigQuery, Dataflow e Cloud Composer (Airflow), além de um Data Warehouse + Data Lake (projeto D4ALL) com dbt, PostgreSQL e SQL Server.'),
      T('Automated resilient incremental ETL in Python (SQL Server, PostgreSQL, Oracle) with retry and reprocessing that eliminated data loss.',
        'Automatizou ETL incremental resiliente em Python (SQL Server, PostgreSQL, Oracle) com retry e reprocessamento que eliminaram perda de dados.'),
      T('Built a leather-tracking integration consolidating multiple SOAP/REST sources, plus Mendix low-code apps and Flask middleware for legacy systems and SAP Hana.',
        'Construiu uma integração de rastreamento de couro consolidando várias fontes SOAP/REST, além de apps low-code em Mendix e middlewares Flask para sistemas legados e SAP Hana.'),
      T('Applied time-series clustering (tslearn) and forecasting (Prophet) to industrial sensor data, surfacing operating patterns and preventive alerts used by field teams, and shipped the clustering as a production feature in Plotly Dash dashboards.',
        'Aplicou clustering de séries temporais (tslearn) e previsão (Prophet) a dados de sensores industriais, identificando padrões operacionais e alertas preventivos usados pelas equipes de campo, e levou o clustering para produção em dashboards Plotly Dash.'),
      T('Replaced manual reports with Streamlit and Plotly Dash dashboards on Kubernetes (GCP), plus Power BI and Grafana, giving non-technical teams continuous operational and financial KPIs; as a Data Analyst, ran forecasting and cash-flow dashboards.',
        'Substituiu relatórios manuais por dashboards Streamlit e Plotly Dash em Kubernetes (GCP), além de Power BI e Grafana, dando KPIs operacionais e financeiros contínuos para times não técnicos; como Data Analyst, fez forecasting e dashboards de fluxo de caixa.'),
      T('Prototyped local LLM agents (Ollama + CrewAI) to analyze time-series events and presented them to technical and business stakeholders as the company\'s first generative AI initiative.',
        'Prototipou agentes LLM locais (Ollama + CrewAI) para analisar eventos em séries temporais e apresentou a stakeholders técnicos e de negócio como a primeira iniciativa de IA generativa da empresa.'),
      T('Standardized client environments with Docker Compose and Terraform, with Node-RED as the integration hub and CPU/memory tuning on edge devices.',
        'Padronizou ambientes de clientes com Docker Compose e Terraform, com Node-RED como hub de integração e ajuste de CPU/memória em dispositivos edge.'),
    ],
    phases: [
      {
        t: T('Analytics, IoT and low-code', 'Analytics, IoT e low-code'),
        when: T('2021 · Data Analyst → Data Engineer', '2021 · Data Analyst → Data Engineer'),
        items: [
          T('Schema mapping, SQL databases, exploratory and time-series analysis (with outlier removal), forecasting and Power BI cash-flow dashboards.', 'Mapeamento de schemas, bancos SQL, análise exploratória e de séries temporais (com remoção de outliers), forecasting e dashboards de fluxo de caixa no Power BI.'),
          T('WinCC Unified screens, MyControls and live sessions for Hydac.', 'Telas WinCC Unified, MyControls e live sessions para a Hydac.'),
          T('Mendix apps (domain model, SOAP/REST integrations) for Viposa, including shipment control.', 'Apps Mendix (domain model, integrações SOAP/REST) para a Viposa, incluindo controle de embarques.'),
          T('Power Automate and SharePoint flows; Power BI over SQL Server and PostgreSQL.', 'Fluxos com Power Automate e SharePoint; Power BI sobre SQL Server e PostgreSQL.'),
        ],
        stack: ['Power BI', 'Python', 'SQL', 'WinCC Unified', 'Mendix', 'Power Automate'],
      },
      {
        t: T('Turning into data engineering', 'Virada para data engineering'),
        when: '2022',
        items: [
          T('Google Cloud IDP program (Professional Data Engineer track) and the Skills Boost data track: Dataflow, BigQuery, streaming analytics.', 'Programa IDP do Google Cloud (trilha Professional Data Engineer) e a trilha de dados do Skills Boost: Dataflow, BigQuery, streaming analytics.'),
          T('First Apache Airflow workflows, dbt transformations, Kafka and Pub/Sub messaging.', 'Primeiros workflows em Apache Airflow, transformações em dbt, mensageria com Kafka e Pub/Sub.'),
          T('SQL Server → PostgreSQL integration via ODBC/pyodbc and SAP Hana integration.', 'Integração SQL Server → PostgreSQL via ODBC/pyodbc e integração com SAP Hana.'),
          T('Node-RED becomes the glue between machines, APIs and databases.', 'Node-RED vira a cola entre máquinas, APIs e bancos.'),
        ],
        stack: ['Python', 'Airflow', 'dbt', 'Kafka', 'GCP Pub/Sub', 'Dataflow', 'SAP Hana', 'Node-RED'],
      },
      {
        t: T('Warehouse, streaming and analytics', 'Warehouse, streaming e analytics'),
        when: '2023',
        items: [
          T('D4ALL project: Data Warehouse + Data Lake with ETL layers and modeling.', 'Projeto D4ALL: Data Warehouse + Data Lake com camadas de ETL e modelagem.'),
          T('Near-real-time industrial pipeline: Pub/Sub → micro-batch on GCP → Python enrichment → InfluxDB.', 'Pipeline industrial near-real-time: Pub/Sub → micro-batch na GCP → enriquecimento em Python → InfluxDB.'),
          T('Streamlit dashboards on Kubernetes serving several clients; Flask middleware for legacy systems.', 'Dashboards Streamlit em Kubernetes atendendo vários clientes; middleware Flask para sistemas legados.'),
          T('Data catalog evaluation: OpenMetadata vs DataHub POC.', 'Avaliação de catálogo de dados: POC OpenMetadata vs DataHub.'),
        ],
        stack: ['BigQuery', 'Pub/Sub', 'InfluxDB', 'dbt', 'Streamlit', 'Kubernetes', 'Flask'],
      },
      {
        t: T('Platform, edge and multi-client', 'Plataforma, edge e multi-cliente'),
        when: T('Jan - Aug 2024', 'jan - ago/2024'),
        items: [
          T('Client environments standardized on Docker Compose, with Node-RED as the central integration hub.', 'Ambientes de clientes padronizados em Docker Compose, com Node-RED como hub central de integração.'),
          T('Field IoT connectivity (MQTT, OPC UA) and CPU/memory tuning on edge devices running Debian and Yocto-based Linux, with Ubuntu on the servers.', 'Conectividade IoT em campo (MQTT, OPC UA) e ajuste de CPU/memória em edge com Debian e Linux baseado em Yocto, com Ubuntu nos servidores.'),
          T('Infra operations: PostgreSQL troubleshooting, backup, disaster recovery and Terraform.', 'Operação de infra: troubleshooting de PostgreSQL, backup, disaster recovery e Terraform.'),
          T('Time series with tslearn (clustering), Prophet and multivariate regression; first local-LLM agents with Ollama + CrewAI (Jul 2024).', 'Séries temporais com tslearn (clustering), Prophet e regressão multivariada; primeiros agentes com LLM local (Ollama + CrewAI, jul/2024).'),
        ],
        stack: ['Docker Compose', 'Node-RED', 'MQTT', 'OPC UA', 'Terraform', 'tslearn', 'Prophet', 'Ollama', 'CrewAI'],
      },
    ],
  },
];

export const RESEARCH = {
  title: T('Researcher, Intelligent Algorithms Applied to Robotics Group', 'Pesquisador, Grupo de Algoritmos Inteligentes Aplicados à Robótica'),
  where: 'UFSM',
  when: T('Jan 2023 - Present · Hybrid', 'jan/2023 - atual · Híbrido'),
  url: 'https://www.ufsm.br/grupos/garra/projetos',
  bullets: [
    T('Implemented DRL algorithms (DDPG, SAC, TD3, SAC-X, SAC-X Hybrid) in PyTorch and TensorFlow for autonomous mobile robot control.', 'Implementou algoritmos de DRL (DDPG, SAC, TD3, SAC-X, SAC-X Hybrid) em PyTorch e TensorFlow para controle autônomo de robôs móveis.'),
    T('Integrated with ROS2 Humble and Gazebo; trained with Curriculum Learning across 6 stages and different LIDAR perception levels.', 'Integração com ROS2 Humble e Gazebo; treino com Curriculum Learning em 6 estágios e diferentes níveis de percepção LIDAR.'),
    T('Designed reproducible experiments: multiple seeds, ablations, experiment tracking and robustness to sensor noise and failures; tuned hyperparameters with TensorBoard and structured code for reuse by the group.', 'Desenhou experimentos reproduzíveis: múltiplas sementes, ablação, rastreamento de experimentos e robustez a ruído e falhas de sensor; ajustou hiperparâmetros com TensorBoard e estruturou o código para reuso pelo grupo.'),
  ],
};

export const PUBLICATIONS = [
  {
    authors: 'Demo Rosa F, Steinmetz R, Tello Gamarra DF',
    title: 'Hybrid Soft Actor-Critic with Curriculum Learning for Sparse-Reward Mobile Robot Navigation',
    venue: 'Journal of Intelligent & Fuzzy Systems',
    year: 2025,
    url: 'https://doi.org/10.1177/18758967261431354',
    repo: 'https://github.com/fabiodemo/turtlebot-sac-x-hybrid',
    abstract: T(
      'Unified empirical study of extended Soft Actor-Critic methods for sparse-reward TurtleBot3 navigation in Gazebo with dense 360-beam LIDAR. SAC-XH is a streamlined SAC extension that adds auxiliary shaping signals to the sparse task reward and a stage-wise curriculum (competence-based advancement, controlled replay transfer). It beats SAC, TD3 and DDPG on training stability, sample efficiency and success rate, on an open-source ROS 2/Gazebo framework.',
      'Estudo empírico unificado de variantes do Soft Actor-Critic para navegação do TurtleBot3 com recompensa esparsa no Gazebo, com LIDAR denso de 360 feixes. O SAC-XH é uma extensão enxuta do SAC que soma sinais auxiliares de shaping à recompensa esparsa e um curriculum por estágios (avanço por competência, transferência controlada de replay). Supera SAC, TD3 e DDPG em estabilidade, eficiência amostral e taxa de sucesso, sobre um framework open source em ROS 2/Gazebo.',
    ),
  },
  {
    authors: 'Steinmetz R, Demo Rosa F, Kich VA, Bottega JA, Bedin Grando R, Tello Gamarra DF',
    title: 'World models for autonomous navigation of terrestrial robots from LIDAR observations',
    venue: 'Journal of Intelligent & Fuzzy Systems 50(6), 1998-2014',
    year: 2026,
    url: 'https://journals.sagepub.com/doi/abs/10.1177/18758967251399741',
    repo: 'https://github.com/raulsteinmetz/turtlebot-dreamerv3',
    abstract: T(
      'Model-based RL on top of DreamerV3: an MLP Variational Autoencoder inside the world model encodes full-resolution LIDAR into compact latents, and a learned dynamics predictor enables imagination-based policy optimization for TurtleBot3 navigation, instead of the simplified observations model-free policies usually need.',
      'RL baseado em modelo sobre o DreamerV3: um Variational Autoencoder MLP dentro do world model codifica o LIDAR em resolução total em latentes compactos, e um preditor de dinâmica aprendido permite otimizar a política por imaginação na navegação do TurtleBot3, em vez das observações simplificadas que políticas model-free costumam exigir.',
    ),
  },
  {
    authors: 'Demo F, Priesnitz Filho W',
    title: 'Gestão de Privacidade no Armazenamento de Dados do Paciente em Registros Médico-Hospitalares Eletrônicos',
    venue: 'Escola Regional de Redes de Computadores (ERRC), SBC, 57-64',
    year: 2019,
    url: 'https://sol.sbc.org.br/index.php/errc/article/view/9212',
    abstract: T(
      'A management service that uses cryptographic methods to encrypt sensitive fields in electronic medical records, so they are readable only by whoever has permission, reducing the risk of attacks and unauthorized use. From the undergraduate research project on user data privacy.',
      'Um serviço de gerenciamento que usa métodos criptográficos para cifrar campos sensíveis em registros médicos eletrônicos, legíveis só para quem tem permissão, reduzindo o risco de ataques e uso não autorizado. Fruto da iniciação científica sobre privacidade de dados do usuário.',
    ),
  },
];

export const ACADEMIC = [
  {
    id: 'provador',
    t: T('Virtual Fitting Room (Provador Virtual)', 'Provador Virtual'),
    role: T('Research volunteer', 'Voluntário em pesquisa'),
    when: T('Aug 2022 - Mar 2023', 'ago/2022 - mar/2023'),
    num: '052316',
    url: 'https://portal.ufsm.br/projetos/participante/meusprojetos/view.html?idProjeto=64340',
    items: [
      T('Trained a U-Net CNN in Python so users can see how clothes would look on their body from a processed image.', 'Treinou uma CNN U-Net em Python para o usuário ver como a roupa ficaria no corpo a partir de uma imagem processada.'),
      T('Used GCP (Cloud Storage, Colab, Vertex AI Workbench) for datasets and training, and sized a local GPU machine to cut cost.', 'Usou GCP (Cloud Storage, Colab, Vertex AI Workbench) para datasets e treino, e dimensionou uma máquina local com GPU para reduzir custo.'),
      T('Built a Flask-RESTful API that receives clothing images and calls the network.', 'Construiu uma API Flask-RESTful que recebe imagens de roupas e chama a rede.'),
    ],
    stack: ['PyTorch / U-Net', 'GCP', 'Vertex AI', 'Flask-RESTful'],
  },
  {
    id: 'privacidade',
    t: T('User Data Privacy Management in Electronic Records', 'Gestão de Privacidade de Dados do Usuário em Registros Eletrônicos'),
    role: T('Undergraduate research fellow', 'Bolsista de iniciação científica'),
    when: T('Apr 2018 - Dec 2019', 'abr/2018 - dez/2019'),
    num: '048625',
    url: 'https://portal.ufsm.br/projetos/participante/meusprojetos/view.html?idProjeto=60070',
    items: [
      T('Evaluated crypto and hash functions (LSH, MD5, SHA-512, homomorphic encryption, ElGamal, searchable encryption) for identity checks between systems without exposing user data.', 'Avaliou funções criptográficas e de hash (LSH, MD5, SHA-512, criptografia homomórfica, ElGamal, searchable encryption) para verificar identidade entre sistemas sem expor dados do usuário.'),
      T('Built REST APIs in Python (Flask-RESTful) and Java (JAX-RS) and a prototype over PostgreSQL with simulated patient records, aligned with GDPR, HIPAA and LGPD.', 'Construiu APIs REST em Python (Flask-RESTful) e Java (JAX-RS) e um protótipo sobre PostgreSQL com prontuários simulados, alinhado a GDPR, HIPAA e LGPD.'),
      T('Resulted in a paper at ERRC 2019.', 'Gerou artigo na ERRC 2019.'),
    ],
    stack: ['Python', 'Java', 'PostgreSQL', 'Cryptography'],
  },
  {
    id: 'seguranca',
    t: T('Physical and Logical Security in the Organizational Environment', 'Segurança Física e Lógica no Ambiente Organizacional'),
    role: T('Extension project volunteer', 'Voluntário em projeto de extensão'),
    when: T('Sep 2017 - Dec 2018', 'set/2017 - dez/2018'),
    num: '044770',
    url: 'https://portal.ufsm.br/projetos/participante/meusprojetos/view.html?idProjeto=55361',
    items: [
      T('Gave information-security awareness lectures for the Army and Air Force in Santa Maria.', 'Deu palestras de conscientização em segurança da informação para o Exército e a Aeronáutica em Santa Maria.'),
      T('Applied CERT.br control guidelines against cybercrime and helped with email data mining for spam detection in Java.', 'Aplicou as diretrizes de controle do CERT.br contra crime cibernético e ajudou na mineração de e-mails para detecção de spam em Java.'),
    ],
    stack: ['Java', 'Security', 'CERT.br'],
  },
  {
    id: 'canoagem',
    t: T('University Sports: UFSM em Movimento (canoeing)', 'Esporte Universitário: UFSM em Movimento (canoagem)'),
    role: T('Participant · canoeing', 'Participante · canoagem'),
    when: T('Project 2019 - 2023', 'Projeto 2019 - 2023'),
    num: '051350',
    url: 'https://portal.ufsm.br/projetos/participante/meusprojetos/view.html?idProjeto=63248',
    items: [
      T('Paddled for UFSM in the university sports project. Not much data engineering here, just a lot of water.', 'Remou pela UFSM no projeto de esporte universitário. Pouca engenharia de dados aqui, muita água.'),
    ],
    stack: [T('Canoeing', 'Canoagem')],
    egg: true,
  },
];

export const EDUCATION = [
  {
    title: T('M.Sc. in Computer Science, Artificial Intelligence', 'Mestrado em Ciência da Computação, Inteligência Artificial'),
    where: 'UFSM',
    when: T('Mar 2023 - Dec 2025', 'mar/2023 - dez/2025'),
    detail: T(
      'Deep Reinforcement Learning for autonomous mobile robot navigation: SAC and its variants (SAC-X Hybrid, SAC Efficient KAN) compared to DDPG and TD3, in ROS/Gazebo with Curriculum Learning, sparse rewards, varying LIDAR perception levels, reproducible multi-seed experiments and sim-to-real tests on a TurtleBot3.',
      'Deep Reinforcement Learning para navegação autônoma de robôs móveis: SAC e variantes (SAC-X Hybrid, SAC Efficient KAN) comparados a DDPG e TD3, em ROS/Gazebo com Curriculum Learning, recompensas esparsas, diferentes níveis de percepção LIDAR, experimentos reproduzíveis com múltiplas sementes e testes sim-to-real no TurtleBot3.',
    ),
  },
  {
    title: T('Technologist Degree (Tecnólogo) in Computer Networks', 'Tecnólogo em Redes de Computadores'),
    where: 'UFSM',
    when: '2016 - 2019',
    detail: T('Networks, Linux, security and data privacy.', 'Redes, Linux, segurança e privacidade de dados.'),
  },
];

export const CERTS = [
  { n: 'Databricks Certified Data Engineer Associate', by: 'Databricks', d: T('Jul 2025', 'jul/2025'), exp: T('Jul 2027', 'jul/2027'), id: '156084596', star: true, use: T('Data engineering on the Databricks Lakehouse', 'Engenharia de dados no Databricks Lakehouse') },
  { n: 'AI Fluency: Framework & Foundations', by: 'Anthropic', d: T('Apr 2026', 'abr/2026'), use: 'AI Fluency' },
  { n: 'Claude Code in Action', by: 'Anthropic', d: T('Apr 2026', 'abr/2026'), use: T('AI-assisted software engineering', 'Engenharia de software assistida por IA') },
  { n: 'Data Quality Testing Unleashed: Theory to Implementation', by: 'Udemy', d: T('Aug 2026', 'ago/2026'), use: 'Data Quality, Python' },
  { n: 'How to Become a Senior Developer: Beyond coding skills', by: 'Udemy', d: T('May 2025', 'mai/2025') },
  { n: 'Software Development Mindsets for Success', by: 'Udemy', d: T('Jan 2025', 'jan/2025') },
  { n: 'Statistics with R', by: 'Udemy', d: T('Mar 2023', 'mar/2023'), use: 'R' },
  { n: 'Deep Learning: Computer Vision, CNNs and Transfer Learning', by: 'Udemy', d: T('Sep 2022', 'set/2022') },
  { n: 'Profissional Adaptável: Inteligência emocional, finanças pessoais e liderança', by: 'PUCRS', d: T('Aug 2022', 'ago/2022') },
  { n: 'Interactive Python Dashboards with Plotly and Dash', by: 'Udemy', d: T('Jun 2022', 'jun/2022') },
  { n: 'Serverless Data Processing with Dataflow: Operations', by: 'Google Cloud Skills Boost', d: T('May 2022', 'mai/2022'), use: 'GCP' },
  { n: 'Serverless Data Processing with Dataflow: Develop Pipelines', by: 'Google Cloud Skills Boost', d: T('May 2022', 'mai/2022'), use: 'GCP' },
  { n: 'Serverless Data Processing with Dataflow: Foundations', by: 'Google Cloud Skills Boost', d: T('May 2022', 'mai/2022'), use: 'GCP' },
  { n: 'Smart Analytics, Machine Learning, and AI on Google Cloud', by: 'Google Cloud Skills Boost', d: T('May 2022', 'mai/2022'), use: 'GCP' },
  { n: 'Building Resilient Streaming Analytics Systems on Google Cloud', by: 'Google Cloud Skills Boost', d: T('May 2022', 'mai/2022'), use: 'GCP' },
  { n: 'Modernizing Data Lakes and Data Warehouses with Google Cloud', by: 'Google Cloud Skills Boost', d: T('Apr 2022', 'abr/2022'), use: 'GCP' },
  { n: 'Google Cloud Big Data and Machine Learning Fundamentals', by: 'Google Cloud Skills Boost', d: T('Apr 2022', 'abr/2022'), use: 'GCP' },
  { n: 'Data Analysis with Pandas and Python', by: 'Udemy', d: T('Feb 2022', 'fev/2022') },
  { n: 'The Complete JavaScript Course 2022: From Zero to Expert!', by: 'Udemy', d: T('Jan 2022', 'jan/2022') },
  { n: 'Google Cloud Computing Foundations: Data, ML, and AI in Google Cloud', by: 'Google Cloud Skills Boost', d: T('Jan 2022', 'jan/2022'), use: 'GCP' },
  { n: 'Google Cloud Computing Foundations: Networking and Security in Google Cloud', by: 'Google Cloud Skills Boost', d: T('Dec 2021', 'dez/2021'), use: 'GCP' },
  { n: 'Google Cloud Computing Foundations: Infrastructure in Google Cloud', by: 'Google Cloud Skills Boost', d: T('Dec 2021', 'dez/2021'), use: 'GCP' },
  { n: 'Google Cloud Computing Foundations: Cloud Computing Fundamentals', by: 'Google Cloud Skills Boost', d: T('Dec 2021', 'dez/2021'), use: 'GCP' },
  { n: 'Google Cloud Essentials', by: 'Google Cloud Skills Boost', d: T('Dec 2021', 'dez/2021'), use: 'GCP' },
];

export const SKILLS = [
  { group: T('Processing', 'Processamento'), icon: 'cpu', items: ['PySpark', 'Spark SQL', 'Delta Lake', 'Liquid Clustering', T('Advanced SQL', 'SQL avançado')] },
  { group: T('Databricks platform', 'Plataforma Databricks'), icon: 'disk', items: ['Unity Catalog', 'Workflows', 'Serverless', 'Asset Bundles', 'DLT', 'AI/BI Dashboards', 'Genie', 'Databricks Apps', 'System tables'] },
  { group: T('Ingestion and integration', 'Ingestão e integração'), icon: 'net', items: ['AWS DMS', 'OCI Data Integration', 'JDBC', 'REST/SOAP APIs', 'Kafka', 'Pub/Sub', 'Reverse ETL (HubSpot)'] },
  { group: T('Infra as code and DevOps', 'Infra como código e DevOps'), icon: 'gear', items: ['Terraform', 'GitHub Actions', 'Docker / Compose', 'Kubernetes', 'Linux (Fedora, Arch, Ubuntu, Debian, Yocto)', 'macOS (M4)'] },
  { group: 'Cloud', icon: 'cloud', items: ['AWS (DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM, EventBridge)', 'OCI', 'GCP (BigQuery, Dataflow, Pub/Sub, Composer)', 'Azure'] },
  { group: T('Governance and security', 'Governança e segurança'), icon: 'lock', items: [T('ABAC, masks and dynamic views', 'ABAC, masks e dynamic views'), 'Data Classification', 'Data contracts', 'PII / SHA-256', 'SSO / SAML', 'Security Analysis Tool', 'UCX'] },
  { group: 'Data quality', icon: 'check', items: ['Great Expectations', 'DQX', 'Elementary', 'dbt', 'SQLFluff'] },
  { group: 'FinOps', icon: 'coin', items: [T('Budgets and alerts', 'Budgets e alertas'), 'Cost dashboards', T('Cluster right-sizing', 'Right-sizing de clusters'), 'DynamoDB on-demand'] },
  { group: T('Databases', 'Bancos de dados'), icon: 'db', items: ['Oracle', 'SQL Server', 'PostgreSQL', 'MySQL', 'DynamoDB', 'MongoDB / DocumentDB', 'InfluxDB', 'Snowflake'] },
  { group: T('Orchestration', 'Orquestração'), icon: 'clock', items: ['Databricks Workflows', 'Apache Airflow / Cloud Composer', 'Lambda + EventBridge', 'dbt (scheduled groups)'] },
  { group: 'MLOps', icon: 'robot', items: ['MLflow', 'MLOps Stacks', 'Asset Bundles', 'Vertex AI Workbench'] },
  { group: 'BI', icon: 'chart', items: ['AI/BI Dashboards', 'Metabase', 'Tableau', 'Power BI', 'Grafana', 'Streamlit'] },
  { group: 'Industrial / IoT', icon: 'chip', items: ['Node-RED', 'MQTT', 'OPC UA', 'WinCC Unified / OA'] },
  { group: T('ML and research', 'ML e pesquisa'), icon: 'robot', items: ['scikit-learn', 'XGBoost', 'LightGBM', 'Spark MLlib', 'tslearn', 'Prophet', 'PyTorch', 'TensorFlow', 'Deep RL (SAC, TD3, DDPG)', 'ROS2 / Gazebo', 'TensorBoard', 'YOLOv8'] },
  { group: T('Generative AI', 'IA generativa'), icon: 'chip', items: ['Mosaic AI Vector Search', 'Embeddings / RAG', 'Databricks Genie', 'AI Gateway', 'LangChain', 'CrewAI', 'Ollama'] },
  { group: T('Statistics and experimentation', 'Estatística e experimentação'), icon: 'chart', items: [T('EDA and hypothesis testing', 'EDA e testes de hipótese'), T('Time-based validation', 'Validação temporal'), T('Multiple seeds and ablations', 'Múltiplas sementes e ablação'), T('Classification metrics and calibration', 'Métricas de classificação e calibração')] },
  { group: T('Languages', 'Linguagens'), icon: 'code', items: ['Python', 'SQL', 'HCL', 'Java', T('JavaScript / TypeScript (Chrome extensions, MV3)', 'JavaScript / TypeScript (extensões Chrome, MV3)'), 'LaTeX', T('Go, C# (studies)', 'Go, C# (estudos)')] },
];

// Repositórios públicos de github.com/fabiodemo (forks ficaram de fora)
const gh = (r) => `https://github.com/fabiodemo/${r}`;
export const REPO_GROUPS = [
  {
    id: 'data',
    name: 'Data Engineering',
    repos: [
      { n: 'data-pipeline-snowflake-dbt', lang: 'Python · dbt', d: T('Airflow DAG loading Postgres → Snowflake incrementally by max primary key, modeled in dbt.', 'DAG Airflow com carga incremental Postgres → Snowflake por max primary key, modelagem em dbt.'), y: 2024 },
      { n: 'fastapi-kafka-postgres-weather', lang: 'Python', d: T('NOAA API → Kafka → Postgres with FastAPI, all on Docker Compose.', 'API NOAA → Kafka → Postgres com FastAPI, tudo em Docker Compose.'), y: 2024 },
      { n: 'dbt-tests', lang: 'SQL · dbt', d: T('dbt Cloud experiments: models, seeds, snapshots and tests.', 'Experimentos com dbt Cloud: models, seeds, snapshots e testes.'), y: 2024 },
      { n: 'PySpark-ML', lang: 'Jupyter · PySpark', d: T('Machine learning with Spark: feature engineering, pipelines, tuning and clustering.', 'Machine Learning com Spark: feature engineering, pipelines, tuning e clustering.'), y: 2024 },
      { n: 'distributed-systems-golang', lang: 'Go', d: T('Distributed log (proglog) with Protobuf, studying distributed systems in Go.', 'Log distribuído (proglog) com Protobuf, estudando sistemas distribuídos em Go.'), y: 2024 },
      { n: 'webscrapping-test', lang: 'Python', d: T('Scraping with Selenium and BeautifulSoup plus data cleaning.', 'Scraping com Selenium e BeautifulSoup + tratamento dos dados.'), y: 2024 },
      { n: 'template-repo', lang: 'Markdown', d: T('Template for data engineering portfolio projects.', 'Template para projetos de portfólio de engenharia de dados.'), y: 2024 },
    ],
  },
  {
    id: 'research',
    name: T('Research · Deep RL and Robotics', 'Pesquisa · Deep RL e Robótica'),
    repos: [
      { n: 'turtlebot-sac-x-hybrid', lang: 'Python · ROS2', d: T('ROS2 + Gazebo framework for DRL on TurtleBot3. Implements SAC, DDPG, TD3, SAC-X and SAC-XH (published paper).', 'Framework ROS2 + Gazebo para DRL no TurtleBot3. Implementa SAC, DDPG, TD3, SAC-X e o SAC-XH (artigo publicado).'), y: 2026, star: true },
      { n: 'turtlebot-project', lang: 'Python · ROS', d: T('DQN vs DDQN for mapless navigation with 24 laser readings, in simulation and in the lab.', 'DQN vs DDQN para navegação sem mapa com 24 leituras de laser, simulação e laboratório.'), y: 2023 },
      { n: 'gym-turtlebot', lang: 'Python', d: T('Gym environment for TurtleBot3 Gazebo simulations, Baselines-compatible.', 'Ambiente Gym para simulações TurtleBot3 no Gazebo, compatível com Baselines.'), y: 2023 },
      { n: 'ros2-rl', lang: 'Python', d: T('Deep RL with CoppeliaSim (PyRep) and Gazebo on ROS2 Foxy.', 'Deep RL com CoppeliaSim (PyRep) e Gazebo no ROS2 Foxy.'), y: 2023 },
      { n: 'Docker-ROS-Foxy', lang: 'Docker · ROS2', d: T('Docker image to run Gazebo + ROS Foxy with TurtleBot3.', 'Imagem Docker para rodar Gazebo + ROS Foxy com TurtleBot3.'), y: 2024 },
      { n: 'Robotica-Movel', lang: 'Python · Octave', d: T('Mobile robotics course: sensors, radar, simulator and ROS practice.', 'Disciplina de robótica móvel: sensores, radar, simulador e prática com ROS.'), y: 2023 },
      { n: 'Yolov8', lang: 'Python', d: T('Object detection studies with YOLOv8.', 'Estudos de detecção de objetos com YOLOv8.'), y: 2023 },
    ],
  },
  {
    id: 'apis',
    name: T('APIs, Infra and AI', 'APIs, Infra e IA'),
    repos: [
      { n: 'crewai-test', lang: 'Python · Docker', d: T('CrewAI agents with a local LLM through Ollama, in containers.', 'Agentes CrewAI com LLM local via Ollama, em containers.'), y: 2024 },
      { n: 'Flask-DockerCompose', lang: 'Python', d: T('Flask API packaged with Dockerfile and Compose.', 'API Flask empacotada com Dockerfile e Compose.'), y: 2023 },
      { n: 'EndPoint-RestApi-Scheduling-Communication', lang: 'Python', d: T('REST API (Flask-RESTful + MySQL) to schedule, query and delete message deliveries.', 'API REST (Flask-RESTful + MySQL) para agendar, consultar e remover envios de comunicação.'), y: 2023 },
    ],
  },
  {
    id: 'ml',
    name: T('ML and Statistics (studies)', 'ML e Estatística (estudos)'),
    repos: [
      { n: 'Truco', lang: 'Python', d: T('Gaúcho Truco card game against a Case-Based Reasoning bot. Grad school project at UFSM.', 'Truco gaudério contra um bot que decide com Case-Based Reasoning. Trabalho da pós na UFSM.'), y: 2023 },
      { n: 'Tensorflow-Developer-Certificate', lang: 'Jupyter', d: T('TensorFlow Developer Certificate prep.', 'Preparação para o TensorFlow Developer Certificate.'), y: 2024 },
      { n: 'Deep-Learning-CV-CNN-TL', lang: 'Jupyter', d: T('Computer vision, CNNs and transfer learning.', 'Visão computacional, CNNs e Transfer Learning.'), y: 2022 },
      { n: 'Plotly-Dash-Course', lang: 'Python', d: T('Interactive dashboards with Plotly and Dash.', 'Dashboards interativos com Plotly e Dash.'), y: 2023 },
      { n: 'course_data_analysis_with_pandas', lang: 'Jupyter', d: T('Data analysis with pandas.', 'Análise de dados com Pandas.'), y: 2022 },
      { n: 'Estatistica-com-R', lang: 'R', d: T('Statistics with R.', 'Estatística com R.'), y: 2023 },
      { n: 'Algebra-Linear-com-R-para-Machine-Learning-e-Modelagens', lang: 'R', d: T('Linear algebra with R for ML and modeling.', 'Álgebra linear com R para ML e modelagem.'), y: 2024 },
    ],
  },
  {
    id: 'games',
    name: T('Games and Apps', 'Jogos e Apps'),
    repos: [
      { n: 'Block-Tetris-Like-Game', lang: 'C# · Unity', d: T('Tetris-like block game made in Unity.', 'Jogo de blocos no estilo Tetris feito em Unity.'), y: 2023 },
      { n: 'FlappyBirb', lang: 'C# · Unity', d: T('Flappy Bird clone in Unity.', 'Clone de Flappy Bird em Unity.'), y: 2023 },
      { n: 'android-guess-it', lang: 'Kotlin', d: T('Android word-guessing app (Udacity course, UI layer).', 'App Android de adivinhação (curso Udacity, camada de UI).'), y: 2024 },
      { n: 'Base-Converter-Android', lang: 'Java', d: T('Number base converter for Android.', 'Conversor de bases numéricas para Android.'), y: 2024 },
      { n: 'Curso-CSharp', lang: 'C#', d: T('C# exercises.', 'Exercícios de C#.'), y: 2024 },
      { n: 'java-oop', lang: 'Java', d: T('Object-oriented programming in Java.', 'Orientação a objetos em Java.'), y: 2024 },
    ],
  },
].map((g) => ({ ...g, repos: g.repos.map((r) => ({ ...r, url: gh(r.n) })) }));

export const FEATURED = [
  {
    t: T('Core portfolio pipeline', 'Pipeline core de portfólio'),
    big: '12-19h → ≤3h',
    body: T(
      'Portfolio returns and positions landed mid-afternoon and held up everything downstream. I split weekday and weekend runs, rebuilt ingestion on AWS DMS plus a processing queue and gave PortfolioReturns its own workflow. Later I moved parts to OCI Data Integration.',
      'Rentabilidade e posições da plataforma de investimentos saíam no meio da tarde e travavam tudo que vinha depois. Separei execuções de dia útil e fim de semana, refiz a ingestão com AWS DMS + fila de processamento e dei workflow próprio ao PortfolioReturns. Depois movi partes para OCI Data Integration.',
    ),
    stack: ['AWS DMS', 'JDBC', 'OCI Data Integration', 'Workflows', 'Serverless', 'Terraform'],
  },
  {
    t: T('Legacy Datalake → Delta Lake + Unity Catalog', 'Datalake legado → Delta Lake + Unity Catalog'),
    big: T('9,574 legacy uses', '9.574 usos legados'),
    body: T(
      'I inherited a migration backlog opened before I joined. Ran a UCX assessment, built an exporter that snapshots the workspaces to Terraform via GitHub Actions (DR copy), moved pipelines and users, then switched the old workspace off.',
      'Herdei um backlog de migração aberto antes de eu entrar. Rodei assessment UCX, criei um exporter que salva os workspaces em Terraform via GitHub Actions (cópia de DR), migrei pipelines e usuários e desliguei o workspace antigo.',
    ),
    stack: ['UCX', 'Unity Catalog', 'Delta Lake', 'Terraform', 'GitHub Actions'],
  },
  {
    t: T('Projeto Ganesha · cash management', 'Projeto Ganesha · cash management'),
    big: T('6 sources, 5 min', '6 fontes, 5 min'),
    body: T(
      'Treasury and the trading desks needed to see available cash, settlements and per-desk usage during the day. I joined Sinacor, B3, TED/PIX, fixed income, funds and an internal API into a near-real-time feed with an AI/BI dashboard, schema checks and retries with backoff.',
      'Tesouraria e mesas precisavam ver caixa disponível, vencimentos e consumo por mesa durante o dia. Juntei Sinacor, B3, TED/PIX, renda fixa, fundos e uma API interna num feed near-real-time com dashboard AI/BI, schema checks e retry com backoff.',
    ),
    stack: ['PySpark', 'Delta Lake', 'Workflows', 'AI/BI', 'UC Volumes'],
  },
  {
    t: 'FinOps',
    big: T('~US$7k → ~US$3k/mo', '~US$7k → ~US$3k/mês'),
    body: T(
      'AWS bill from about US$7k to US$3k a month, an estimated US$2-4k/mo saved. My part: breaking up heavy pipelines (DMS + single node, serverless by default), DynamoDB on-demand (US$105 → ≤US$5/mo), Nelogica from US$30 to US$6/day, an egress spike stopped, per-group budgets and a cost dashboard, plus reviewing the storage cleanup (Glacier tiering and unused buckets) that the team executed.',
      'Fatura AWS de cerca de US$7k para US$3k por mês, economia estimada de US$2-4k/mês. Minha parte: quebrar pipelines pesados (DMS + single node, serverless por padrão), DynamoDB on-demand (US$105 → ≤US$5/mês), Nelogica de US$30 para US$6/dia, um pico de egress cortado, budgets por grupo e dashboard de custo, além de revisar a limpeza de storage (Glacier e buckets sem uso) que o time executou.',
    ),
    stack: ['System tables', 'Budgets', 'Serverless', 'DynamoDB', 'Terraform'],
  },
  {
    t: T('Jira backup in the lakehouse', 'Backup do Jira no lakehouse'),
    big: '575k issues',
    body: T(
      'After the tool switch, the whole Jira history (204 projects) became one sensitive table and 53 masked views. 27 GB of XML processed in 4 minutes.',
      'Depois da troca de ferramenta, o histórico inteiro do Jira (204 projetos) virou uma tabela sensitive e 53 views mascaradas. 27 GB de XML processados em 4 minutos.',
    ),
    stack: ['Parquet', 'UC Volumes', 'Delta Lake', 'ABAC', 'Terraform'],
  },
  {
    t: T('PII governance and access as code', 'Governança de PII e acesso como código'),
    big: T('640+ IaC commits', '640+ commits de IaC'),
    body: T(
      'Access was granted by hand, personal data sat in plain columns and the platform had no posture checks. Now grants, catalogs, schemas and views live in Terraform, so every access change is a reviewed pull request; PII sits behind dynamic views and SHA-256 hashes, with ABAC, Data Classification, governed tags, SSO, the Security Analysis Tool and a credential audit (3 of 13 roles fixed).',
      'Acesso era dado na mão, dado pessoal ficava em coluna aberta e a plataforma não tinha checagem de postura. Hoje grants, catálogos, schemas e views vivem em Terraform, então toda mudança de acesso é um pull request revisado; PII fica atrás de dynamic views e hash SHA-256, com ABAC, Data Classification, governed tags, SSO, Security Analysis Tool e auditoria de credenciais (3 de 13 roles corrigidas).',
    ),
    stack: ['Unity Catalog', 'ABAC', 'Data Classification', 'SAT', 'SSO', 'Terraform'],
  },
  {
    t: T('ML and AI platform', 'Plataforma de ML e IA'),
    big: T('dev → stg → prd', 'dev → stg → prd'),
    body: T(
      'Data science had no environments or deploy path, and business teams wanted to ask the data questions in plain language. I set up the ML environments and CI/CD (MLOps Stacks, Asset Bundles, GitHub Actions), then rolled out Genie to the whole company on the same grants and PII masks, with a US$9 per-user cap and a cost dashboard.',
      'Data Science não tinha ambientes nem caminho de deploy, e as áreas de negócio queriam perguntar coisas aos dados em linguagem natural. Montei os ambientes de ML e o CI/CD (MLOps Stacks, Asset Bundles, GitHub Actions) e depois levei o Genie para a empresa toda sobre os mesmos grants e masks de PII, com teto de US$9 por usuário e dashboard de custo.',
    ),
    stack: ['MLOps Stacks', 'Asset Bundles', 'MLflow', 'Genie', 'Vector Search', 'GitHub Actions'],
  },
  {
    t: 'HubSpot reverse ETL',
    big: T('1.7M contacts', '1,7M contatos'),
    body: T(
      'Customer data flowing from the lakehouse back into the CRM at the scale of the whole client base, with Spark, threads and async calls.',
      'Dado do cliente saindo do lakehouse de volta para o CRM, na escala da base inteira, com Spark, threads e chamadas async.',
    ),
    stack: ['HubSpot API', 'PySpark', 'Lambda', 'EventBridge'],
  },
];

// Itens da Lixeira: piadas que contam coisas reais
export const TRASH = [
  { n: T('legacy_datalake/', 'datalake_legado/'), d: T('Legacy workspace. Shut down in Jun 2026, with a Terraform backup.', 'Workspace legado. Desligado em jun/2026, com backup em Terraform.') },
  { n: 'portfolio_pipeline_19h.ipynb', d: T('The version that ran 12-19h. Replaced by the one that runs in ≤3h.', 'Versão que rodava 12-19h. Substituída pela que roda em ≤3h.') },
  { n: 'dynamodb_provisioned.tf', d: T('US$105/mo. Now on-demand, ~US$5/mo.', 'US$105/mês. Hoje on-demand, ~US$5/mês.') },
  { n: 'sinacor_history_120_columns.sql', d: T('Now 12 columns. From >3h to ~40 min.', 'Virou 12 colunas. De >3h para ~40 min.') },
  { n: 'mongo_full_reload.py', d: T('4h full reloads. Replaced by incremental JDBC upserts in 5 min.', 'Reload completo de 4h. Trocado por upserts incrementais JDBC em 5 min.') },
  { n: T('unused_buckets/', 'buckets_sem_uso/'), d: T('Moved to Glacier or deleted. Part of taking the AWS bill from ~US$7k to ~US$3k a month.', 'Foram para o Glacier ou apagados. Parte de levar a fatura AWS de ~US$7k para ~US$3k por mês.') },
  { n: 'contacts.ctt', d: T('Old contact list export. Everyone shows as Away now.', 'Lista de contatos antiga. Todo mundo aparece como Ausente agora.') },
  { n: 'GTASAsf1.b', d: T('Save at 100%. Kept only the lessons.', 'Save em 100%. Fiquei só com as lições.') },
  { n: 'giant_fees_cluster.json', d: T('Replaced by DMS + single node: -80% AWS cost.', 'Trocado por DMS + single node: -80% no custo AWS.') },
];

// Bloco de skills do currículo formatado (curado, para caber numa página)
export const RESUME_SKILLS = [
  [T('Languages', 'Linguagens'), 'Python, SQL, PySpark, HCL (Terraform), Java, Bash'],
  ['Data platform', 'Databricks (Unity Catalog, Workflows, DLT, Asset Bundles, Serverless, Genie), Delta Lake, Apache Spark, dbt, Airflow'],
  [T('Cloud and IaC', 'Cloud e IaC'), 'AWS (DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM), OCI, GCP (BigQuery, Dataflow, Pub/Sub, Composer), Azure, Terraform, GitHub Actions, Docker, Kubernetes'],
  [T('Governance and quality', 'Governança e qualidade'), 'ABAC, column masks, data contracts, PII/LGPD, Data Classification, Great Expectations, DQX, Elementary'],
  ['ML / MLOps / GenAI', 'MLflow, MLOps Stacks, scikit-learn, XGBoost, LightGBM, tslearn, Prophet, PyTorch, Deep RL, Mosaic AI Vector Search, RAG'],
  [T('Databases', 'Bancos de dados'), 'Oracle, SQL Server, PostgreSQL, MySQL, DynamoDB, MongoDB, InfluxDB, Snowflake'],
  [T('Systems', 'Sistemas'), 'Linux (Fedora, Arch, Ubuntu, Debian, Yocto), macOS, MQTT, OPC UA, Node-RED'],
];

// Projetos que entram no currículo formatado
export const RESUME_PROJECTS = [
  { t: 'turtlebot-sac-x-hybrid', d: T('ROS2 + Gazebo framework for DRL on TurtleBot3 (SAC, TD3, DDPG, SAC-X, SAC-XH); code behind the 2025 JIFS paper.', 'Framework ROS2 + Gazebo para DRL no TurtleBot3 (SAC, TD3, DDPG, SAC-X, SAC-XH); código do artigo de 2025 no JIFS.'), url: 'https://github.com/fabiodemo/turtlebot-sac-x-hybrid' },
  { t: 'data-pipeline-snowflake-dbt', d: T('Airflow DAG with incremental Postgres → Snowflake loads by max key, modeled in dbt.', 'DAG Airflow com cargas incrementais Postgres → Snowflake por max key, modeladas em dbt.'), url: 'https://github.com/fabiodemo/data-pipeline-snowflake-dbt' },
  { t: 'fastapi-kafka-postgres-weather', d: T('Streaming pipeline: NOAA API → Kafka → Postgres with FastAPI, on Docker Compose.', 'Pipeline de streaming: API NOAA → Kafka → Postgres com FastAPI, em Docker Compose.'), url: 'https://github.com/fabiodemo/fastapi-kafka-postgres-weather' },
  { t: T('User data privacy in electronic records (UFSM)', 'Privacidade de dados em registros eletrônicos (UFSM)'), d: T('Undergraduate research on privacy-preserving identity checks (homomorphic and searchable encryption, LSH); REST APIs in Python and Java; ERRC 2019 paper.', 'Iniciação científica sobre verificação de identidade com preservação de privacidade (criptografia homomórfica e searchable, LSH); APIs REST em Python e Java; artigo na ERRC 2019.') },
];

// Estudos de caso (STAR) para o fórum
export const CASES = [
  {
    t: T('A gain that had to be won back', 'Um ganho que precisou ser reconquistado'),
    s: T('After the portfolio pipeline stopped running on weekends to save cost, one queue table grew from 10-12 minutes to 1h30.', 'Depois que o pipeline de portfólio parou de rodar no fim de semana para economizar, uma tabela de fila subiu de 10-12 minutos para 1h30.'),
    a: T('Measured the regression instead of reverting the saving, then moved that single load to OCI Data Integration.', 'Medi a regressão em vez de desfazer a economia, e movi só aquela carga para o OCI Data Integration.'),
    r: T('Kept the weekend savings and brought the table back down. Cost work only counts if you measure both sides.', 'Mantive a economia do fim de semana e baixei a tabela de volta. Trabalho de custo só vale se medir os dois lados.'),
  },
  {
    t: T('Switching off a workspace without breaking anyone', 'Desligar um workspace sem quebrar ninguém'),
    s: T('A legacy workspace was still used by pipelines and people, with a migration backlog older than my time on the team.', 'Um workspace legado ainda era usado por pipelines e pessoas, com um backlog de migração mais antigo que eu no time.'),
    a: T('Mapped every dependency with UCX (9,574 legacy table uses), took a full Terraform snapshot as the rollback plan, then migrated in batches with a public guide.', 'Mapeei cada dependência com UCX (9.574 usos de tabelas legadas), tirei um snapshot completo em Terraform como plano de rollback e migrei em lotes com um guia público.'),
    r: T('Backlog closed in June 2025; the workspace was shut down a year later, with the Terraform backup kept.', 'Backlog fechado em junho de 2025; o workspace foi desligado um ano depois, com o backup em Terraform guardado.'),
  },
  {
    t: T('A bad day on call', 'Um dia ruim de plantão'),
    s: T('Five API pipelines failed at once on the same dependency conflict, during a stretch of 52 incidents in six weeks.', 'Cinco pipelines de API falharam juntos pelo mesmo conflito de dependência, num período de 52 incidentes em seis semanas.'),
    a: T('Traced the shared cause, fixed all five the same morning, then hardened the shared classes: empty-input handling, retries and failure alerts.', 'Achei a causa comum, corrigi os cinco na mesma manhã e reforcei as classes compartilhadas: tratamento de entrada vazia, retries e alertas de falha.'),
    r: T('All five closed by early afternoon; 27 of the 52 incidents were closed the day they opened.', 'Os cinco fechados no começo da tarde; 27 dos 52 incidentes foram fechados no mesmo dia em que abriram.'),
  },
  {
    t: T('Raising the whole team', 'Puxando o time inteiro'),
    s: T('Databricks shipped new features every month and the team had no routine to learn them.', 'O Databricks lançava features todo mês e o time não tinha rotina para aprender.'),
    a: T('Started a weekly knowledge exchange, shared more than 30 features as they shipped, built a bot for automated KPI reports and moved planning to weekly cycles.', 'Criei um knowledge exchange semanal, compartilhei mais de 30 features no lançamento, fiz um bot de relatórios automáticos de KPI e levei o planejamento para ciclos semanais.'),
    r: T('A standing learning routine; features like serverless performance mode went from a shared link to the team default.', 'Uma rotina fixa de aprendizado; features como o performance mode do serverless passaram de link compartilhado a padrão do time.'),
  },
];

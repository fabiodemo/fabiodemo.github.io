// Todo o conteúdo do CV fica aqui, em inglês e português: T('english', 'português').
import { T } from './i18n.js';

export const PROFILE = {
  name: 'Fábio Demo da Rosa',
  short: 'Fábio',
  role: 'Senior Data Platform Engineer',
  focus: 'Lakehouse · MLOps · Databricks',
  location: T('Santa Maria, RS, Brazil', 'Santa Maria, RS, Brasil'),
  github: 'https://github.com/fabiodemo',
  linkedin: 'https://www.linkedin.com/in/fabiodemo',
  // Preencha para aparecer no site. Vazio = escondido.
  email: '',
  summary: T(
    'Senior Data Platform Engineer with 5+ years in data and ML. I build and run the Databricks lakehouse on AWS behind an investment platform and am the principal author of its ingestion and governance layer: pipelines shaped around how each source changes, PII masked by default, everything in Terraform. On the MLOps side, I built the Data Science team\'s path to production (MLOps Stacks, MLflow, Asset Bundles, CI/CD across dev/stg/prd) and the churn pipeline on it. Before that, industrial IoT and time-series ML in production; M.Sc. in Computer Science with published research on Deep Reinforcement Learning.',
    'Senior Data Platform Engineer com mais de 5 anos em dados e ML. Construo e opero o lakehouse Databricks na AWS por trás de uma plataforma de investimentos e sou o principal autor da camada de ingestão e governança: pipelines modelados pelo jeito que cada origem muda, PII mascarada por padrão, tudo em Terraform. No lado de MLOps, construí o caminho para produção do time de Data Science (MLOps Stacks, MLflow, Asset Bundles, CI/CD em dev/stg/prd) e o pipeline de churn em cima dele. Antes disso, IoT industrial e ML de séries temporais em produção; mestrado em Ciência da Computação com pesquisa publicada em Deep Reinforcement Learning.',
  ),
  about: T(
    'Drawn to data-intensive systems where scale, latency and correctness trade-offs actually matter. I follow the open-source ecosystem closely and run Fedora and Arch Linux at home (macOS on an M4 at work), which keeps me honest about what happens under the abstractions.',
    'Gosto de sistemas data-intensive, onde trade-offs de escala, latência e corretude importam de verdade. Acompanho de perto o ecossistema open source e uso Fedora e Arch Linux em casa (macOS num M4 no trabalho), o que me mantém honesto sobre o que acontece por baixo das abstrações.',
  ),
};

export const LANGUAGES = [
  { n: T('Portuguese', 'Português'), lv: T('Native', 'Nativo'), p: 100 },
  { n: T('English', 'Inglês'), lv: T('Full professional', 'Profissional completo'), p: 85 },
  { n: T('Spanish', 'Espanhol'), lv: T('Elementary', 'Básico'), note: T('follows work meetings with Argentine colleagues', 'acompanha reuniões com colegas argentinos'), p: 35 },
];

// Sistemas internos, pelo que fazem (sem o nome dos bancos)
export const SYS = {
  pms: T('Portfolio Management System', 'Sistema de Consolidação de Carteiras'),
  oms: T('Order Management & Commissions', 'Sistema de Boletagem e Comissionamento'),
  fees: T('Fee Billing Engine', 'Sistema de Tarifação e Cobrança de Taxas'),
};

export const STATS = [
  { k: '8,302', kp: '8.302', v: T('commits across 5 repos', 'commits em 5 repos') },
  { k: '68% · 61%', v: T('of pipeline and IaC commits', 'dos commits de pipelines e de IaC') },
  { k: '30+', v: T('production jobs on my patterns', 'jobs de produção nos meus padrões') },
  { k: T('6.5B rows', '6,5 bi linhas'), v: T('kept current in D-1', 'atualizadas em D-1') },
  { k: '-69%', v: T('AWS bill, ~US$11k → ~US$3.4k/mo', 'fatura AWS, ~US$11k → ~US$3,4k/mês') },
  { k: '12-19h → ≤3h', v: T('core portfolio pipeline', 'pipeline core de portfólio') },
].map((s) => ({ ...s, k: T(s.k, s.kp || s.k) }));

export const EXPERIENCE = [
  {
    id: 'warren',
    company: 'Warren Investimentos',
    title: 'Data Platform Engineer → Senior Data Platform Engineer',
    when: T('Jun 2024 - Present', 'jun/2024 - atual'),
    place: T('Porto Alegre, RS · Remote', 'Porto Alegre, RS · Remoto'),
    roles: [
      ['Senior Data Platform Engineer', T('Jan 2026 - Present', 'jan/2026 - atual')],
      ['Data Platform Engineer', T('Jun 2024 - Dec 2025', 'jun/2024 - dez/2025')],
    ],
    note: T(
      'Investment fintech, DataOps team. Principal author of the ingestion and governance layer of the Databricks lakehouse on AWS (68% of pipeline commits, 61% of IaC), whose patterns now run 30+ production jobs. Promoted to Senior in Jan 2026. The arc: deliveries for one area (2024), replicable patterns (2025), platform, MLOps and governance (2026).',
      'Fintech de investimentos, time de DataOps. Principal autor da camada de ingestão e governança do lakehouse Databricks na AWS (68% dos commits de pipelines, 61% do IaC), com padrões que hoje sustentam mais de 30 jobs de produção. Promovido a Sênior em jan/2026. O arco: entregas para uma área (2024), padrões replicáveis (2025), plataforma, MLOps e governança (2026).',
    ),
    stack: ['Databricks', 'PySpark', 'Delta Lake', 'Unity Catalog', 'MLflow', 'MLOps Stacks', 'AWS DMS', 'Terraform', 'OCI', 'dbt', 'DQX', 'GitHub Actions'],
    periods: [
      {
        role: 'Senior Data Platform Engineer',
        when: T('Jan 2026 - Present', 'jan/2026 - atual'),
        t: T('ML platform, cost and governance at platform level', 'Plataforma de ML, custo e governança no nível da plataforma'),
        resume: [0, 1, 2, 4],
        stack: ['MLflow', 'MLOps Stacks', 'Asset Bundles', 'Mosaic AI Vector Search', 'Genie', 'Delta Sharing', 'Serverless', 'Terraform', 'System tables'],
        bullets: [
          T('Built the ML platform for the Data Science team on Databricks: dev/stg/prd catalogs, buckets and a dedicated cluster as code, MLOps Stacks as the project template, MLflow tracking and GitHub Actions deploying ML projects through Asset Bundles, so experiments are tracked, versioned and promoted to production reproducibly. On it, structured the churn pipeline with the data scientists: extraction, feature engineering and batch inference, with time-based validation.',
            'Construiu a plataforma de ML do time de Data Science no Databricks: catálogos, buckets e cluster dedicado em dev/stg/prd como código, MLOps Stacks como template, tracking no MLflow e GitHub Actions publicando projetos de ML via Asset Bundles, para que experimentos sejam rastreados, versionados e promovidos a produção de forma reprodutível. Nela, estruturou o pipeline de churn junto aos cientistas de dados: extração, feature engineering e inferência em batch, com validação temporal.'),
          T('Brought GenAI onto the governed platform: Mosaic AI Vector Search over NPS data to feed customer-satisfaction signals into ML work, and Databricks Genie for the whole company on the same Unity Catalog grants and PII masks, with per-user spend limits (US$9) and a cost dashboard that kept AI usage inside the free tier.',
            'Trouxe GenAI para dentro da plataforma governada: Vector Search no Mosaic AI sobre dados de NPS para levar sinais de satisfação do cliente ao trabalho de ML, e Databricks Genie para a empresa toda sobre os mesmos grants e masks de PII do Unity Catalog, com limite de gasto por usuário (US$9) e dashboard de custo que mantiveram o uso de IA dentro do free tier.'),
          T('Was one of the drivers of the FinOps work that took the AWS bill from ~US$11k to ~US$3.4k a month (-69%, Sep 2025 to Sep 2026): a DMS + single-node or serverless standard for heavy pipelines (portfolio management system: 6 workflows into 1, -67% in total and -92% in AWS; fee billing and order management: -78.5% in AWS + Databricks, the fee pipeline 1h+ faster), a data-sharing egress spike traced and stopped, and the storage cleanup reviewed (Glacier tiering, unused buckets).',
            'Foi um dos responsáveis pelo FinOps que levou a fatura AWS de ~US$11k para ~US$3,4k por mês (-69%, set/2025 a set/2026): padrão DMS + single node ou serverless para pipelines pesados (sistema de consolidação de carteiras: de 6 workflows para 1, -67% no total e -92% na AWS; tarifação e boletagem: -78,5% em AWS + Databricks, com o pipeline de tarifação mais de 1h mais rápido), um pico de egress de data sharing rastreado e cortado, e a limpeza de storage revisada (Glacier, buckets sem uso).'),
          T('Extended the platform\'s Terraform workflow module with serverless per task (73% of the top jobs\' DBU now serverless), job chaining (run_job_task) and for-each loops, now behind an intraday portfolio aggregator in production; opened Delta Sharing to partners without Databricks (one schema per partner, expiring tokens, usage dashboard on the audit log), ~600K requests at 100% success.',
            'Estendeu o módulo Terraform de workflow da plataforma com serverless por task (73% do DBU dos jobs mais caros já em serverless), encadeamento de jobs (run_job_task) e laços for-each, hoje por trás de um agregador intraday de carteiras em produção; abriu Delta Sharing para parceiros sem Databricks (um schema por parceiro, tokens com validade, dashboard de uso sobre o audit log), com ~600 mil requisições e 100% de sucesso.'),
          T('Brought two new internal Postgres systems to the warehouse in 5 weeks (one in 2 days, 144 objects) with PII masked from day one: watermark loads, MERGE only on changed rows and delete reconciliation with a safety limit. A discovery study (28% coverage against the old source, 98.6% agreement where present) led to recommending a hybrid model instead of a full swap.',
            'Levou dois sistemas internos novos em Postgres ao DW em 5 semanas (um deles em 2 dias, 144 objetos) com PII mascarada desde o primeiro dia: carga por watermark, MERGE só quando a linha muda e reconciliação de exclusões com limite de segurança. Um estudo de descoberta (28% de cobertura contra a fonte antiga, 98,6% de concordância quando presente) levou a recomendar um modelo híbrido em vez de troca total.'),
          T('Rebuilt the company\'s whole Jira history as governed tables: 575k issues and 941k comments streamed from 27 GB of XML in 4 min; a PII scan first showed sensitive values in free text, so every free-text field is hashed, behind 1 sensitive table and 53 masked views.',
            'Reconstruiu o histórico inteiro do Jira da empresa como tabelas governadas: 575k issues e 941k comentários processados de 27 GB de XML em 4 min; um scan de PII antes mostrou dado sensível em texto livre, então todo campo de texto livre é hasheado, atrás de 1 tabela sensitive e 53 views mascaradas.'),
          T('Wrote the feasibility study behind the decision to move an internal data platform to Databricks, shipped a Databricks App for banking analytics (React + TypeScript, 25 SQL queries), and fixed a broken TLS chain in the Sinacor integration by building the full chain and validating the right hostname instead of turning verification off, now a documented pattern reused by other apps.',
            'Escreveu o estudo de viabilidade que embasou a decisão de migrar uma plataforma interna de dados para o Databricks, entregou um Databricks App de analytics bancário (React + TypeScript, 25 queries SQL) e corrigiu a cadeia TLS da integração com o Sinacor montando a cadeia completa e validando o hostname certo em vez de desligar a verificação, hoje um padrão documentado e reaplicado em outras aplicações.'),
          T('Raised the team: started a weekly Knowledge Exchange (30+ Databricks features shared as they shipped), built a DataOps bot for automated KPI reports, moved planning to weekly cycles and added AI coding assistant instructions (CLAUDE.md, AGENTS.md, Copilot) to every repo.',
            'Puxou o time junto: criou um Knowledge Exchange semanal (30+ features do Databricks compartilhadas no lançamento), um bot de DataOps para relatórios automáticos de KPI, levou o planejamento para ciclos semanais e colocou instruções para assistentes de código (CLAUDE.md, AGENTS.md, Copilot) em todos os repos.'),
        ],
      },
      {
        role: 'Data Platform Engineer',
        when: T('Jun 2024 - Dec 2025', 'jun/2024 - dez/2025'),
        t: T('Ingestion patterns, governance and the first big wins', 'Padrões de ingestão, governança e os primeiros grandes ganhos'),
        resume: [0, 1, 2, 3, 4],
        stack: ['AWS DMS', 'PySpark', 'Delta Lake', 'Unity Catalog', 'OCI Data Integration', 'Kafka', 'Lambda', 'dbt', 'Great Expectations', 'Terraform'],
        bullets: [
          T('Redesigned the core portfolio pipeline around the source\'s own reprocessing queue: delete and reinsert by portfolio window (the source recalculates the whole interval, so replacing it beats MERGE and also carries deletes), keeping 6.5B rows (~250 GB) current in D-1. Portfolio returns went from 12-19h to ≤3h, positions from 10-12h to 1-2h, and weekly loads became daily.',
            'Redesenhou o pipeline core de portfólio em cima da própria fila de reprocessamento da origem: apagar e reinserir por janela de portfólio (a origem recalcula o intervalo inteiro, então substituir é melhor que MERGE e ainda propaga exclusões), mantendo 6,5 bi de linhas (~250 GB) atualizadas em D-1. Rentabilidade das carteiras de 12-19h para ≤3h, posições de 10-12h para 1-2h, e cargas semanais viraram diárias.'),
          T('Designed an ephemeral AWS DMS ingestion where the infrastructure is created and destroyed inside each Databricks job: endpoints and instance up, one DMS task per table, everything torn down at the end, with a Terraform-generated DAG of up to 210 tasks and a cleanup Lambda for forgotten instances. Used for ~50 Sinacor (Oracle) tables a day and reused across 6 sources; heavy tasks from >3h to 15-16 min, a historic table from 120 to 12 columns and from >3h to ~40 min.',
            'Desenhou uma ingestão com AWS DMS efêmero, em que a infraestrutura nasce e morre dentro de cada job do Databricks: sobe endpoints e instância, roda uma task de DMS por tabela e apaga tudo no fim, com DAG de até 210 tasks gerado por Terraform e uma Lambda que limpa instâncias esquecidas. Usada para ~50 tabelas do Sinacor (Oracle) por dia e reaproveitada em 6 origens; tasks pesadas de >3h para 15-16 min, tabela histórica de 120 para 12 colunas e de >3h para ~40 min.'),
          T('Implemented PII-masked-by-default governance as code: raw data in a sensitive layer, 150+ dynamic views hashing PII with SHA-256 (joins still work) and tag-based ABAC row filters, so a new table without tags is never exposed; plus grants, workspace provisioning, SSO and the Security Analysis Tool, all in Terraform (640+ commits, 220+ access tickets).',
            'Implementou governança com PII mascarada por padrão, como código: dado bruto numa camada sensitive, mais de 150 views dinâmicas que trocam PII por hash SHA-256 (o join continua funcionando) e filtro por linha com ABAC ligado a tags, então tabela nova sem tag nunca fica exposta; além de grants, provisionamento de workspaces, SSO e Security Analysis Tool, tudo em Terraform (640+ commits, 220+ tickets de acesso).'),
          T('Co-led with the tech lead the productization of Ganesha, the intraday cash-management platform for Treasury and Operations: moved loose notebooks to standard workflows, sized a memory-optimized always-warm cluster and isolated the B3 settlement query (4+ min) behind most failures. It now refreshes every 20 min on business days (~4,800 runs per quarter at 95% success) for a liquidity dashboard with 20+ users.',
            'Coliderou com o líder técnico a produtização do Ganesha, a plataforma de caixa intradiário da Tesouraria e de Operações: levou os notebooks avulsos para workflows padronizados, dimensionou um cluster otimizado para memória sempre aquecido e isolou a consulta de liquidações B3 (4+ min) que causava a maioria das falhas. Hoje atualiza a cada 20 min nos dias úteis (~4.800 execuções por trimestre, 95% de sucesso) para um painel de liquidez com mais de 20 usuários.'),
          T('Rebuilt the B3 market data pipeline from 24h+ (D-2/D-3) to D-1: closing and intraday prices split, only relevant tickers kept from the start, duplicate and abnormal-growth checks, partitioned Kafka batches. About 75% less runtime and 80% less daily cost, at 98-100% success.',
            'Reescreveu o pipeline de market data da B3 de mais de 24h (D-2/D-3) para D-1: fechamentos separados dos preços correntes, só os tickers relevantes desde o início, checks de duplicidade e de crescimento anormal, envio ao Kafka em lotes particionados. Cerca de 75% menos tempo e 80% menos custo diário, com 98% a 100% de sucesso.'),
          T('Created a single pipeline template (source client, table class, parameterized task, Terraform workflow) with guards where mistakes cost money, such as a volume lock before paid APIs; it brought 12+ sources to production (APIs, databases, FTP, Drive, third-party S3, Azure Service Bus, GA4 from BigQuery) at 93-100% success.',
            'Criou um molde único de pipeline (cliente da fonte, classe de tabela, task parametrizada, workflow em Terraform) com proteções onde o erro custa caro, como trava de volume antes de API paga; com ele, mais de 12 fontes chegaram a produção (APIs, bancos, FTP, Drive, S3 de terceiros, Azure Service Bus, GA4 do BigQuery) com 93% a 100% de sucesso.'),
          T('Led the ingestion re-architecture for the AWS → OCI migration (OCI Data Integration) with zero pipeline downtime; Core pipelines went from 5-7h to ~1h45 with 40 tables moved.',
            'Liderou a re-arquitetura de ingestão na migração AWS → OCI (OCI Data Integration) sem downtime de pipeline; pipelines Core de 5-7h para ~1h45 e 40 tabelas migradas.'),
          T('Moved pipelines and users off the legacy Datalake to Delta Lake + Unity Catalog (a UCX assessment found 9,574 legacy table uses), closing the backlog in Jun 2025; the old workspace was shut down in Jun 2026 with a Terraform backup.',
            'Migrou pipelines e usuários do Datalake legado para Delta Lake + Unity Catalog (assessment UCX com 9.574 usos de tabelas legadas), fechando o backlog em jun/2025; o workspace antigo foi desligado em jun/2026 com backup em Terraform.'),
          T('Shipped a reverse ETL from the lakehouse to HubSpot that diffs the last two Delta versions (time travel as CDC), so only changed records go out, with batch endpoints, threads, async calls and retries, syncing 1.7M contacts at 100% success; replaced Lambda polling with EventBridge schedules.',
            'Entregou reverse ETL do lakehouse para o HubSpot que compara as duas últimas versões Delta (time travel como CDC), então só sai o que mudou, com endpoints em batch, threads, chamadas async e retry, sincronizando 1,7M de contatos com 100% de sucesso; trocou polling em Lambda por agendamentos no EventBridge.'),
          T('Owned Silver-layer data quality: revived a dbt + Elementary repository stalled for two years, retired 79% of obsolete sources and restored production test coverage, then added Great Expectations and DQX checks for integrity, volume and business rules, with Slack alerts.',
            'Responsável pelo data quality da camada Silver: revitalizou um repositório dbt + Elementary parado havia dois anos, eliminou 79% das fontes obsoletas e restabeleceu a cobertura de testes em produção, depois somou checks de Great Expectations e DQX para integridade, volume e regras de negócio, com alertas no Slack.'),
          T('Refactored a MongoDB pipeline to incremental JDBC upserts (4h → 5 min) and replaced pandas ingestion with distributed Spark reads in high-volume pipelines; moved 9 DynamoDB tables to on-demand (US$105 → ~US$5/mo) and removed unused clusters, EKS extended support and Airbyte from the IaC.',
            'Refatorou um pipeline MongoDB para upserts incrementais via JDBC (4h → 5 min) e trocou ingestão em pandas por leituras distribuídas em Spark nos pipelines de alto volume; passou 9 tabelas DynamoDB para on-demand (US$105 → ~US$5/mês) e tirou do IaC clusters sem uso, o suporte estendido do EKS e o Airbyte.'),
        ],
      },
    ],
  },
  {
    id: 'grey',
    company: 'GreyLogix Brasil',
    title: 'Data Analyst → Data Engineer',
    when: T('Feb 2021 - Jun 2024', 'fev/2021 - jun/2024'),
    place: 'Florianópolis, SC',
    roles: [
      ['Data Engineer', T('Sep 2021 - Jun 2024', 'set/2021 - jun/2024')],
      ['Data Analyst', T('Feb 2021 - Sep 2021', 'fev/2021 - set/2021')],
    ],
    resume: [1, 2, 5, 7],
    note: T(
      'Industrial automation and data integrator. Started as a Data Analyst, moved to Data Engineer and ended up running data, cloud and edge for several industrial clients at once. Path: analytics → industrial IoT → data engineering → platform/edge.',
      'Integradora de automação industrial e dados. Entrei como Data Analyst, virei Data Engineer e saí cuidando de dados, cloud e edge para vários clientes industriais ao mesmo tempo. Trajetória: analytics → IoT industrial → data engineering → plataforma/edge.',
    ),
    stack: ['Python', 'GCP (BigQuery, Dataflow, Pub/Sub, Composer)', 'Airflow', 'dbt', 'Kafka', 'SQL Server', 'PostgreSQL', 'Oracle', 'InfluxDB', 'Docker', 'Kubernetes', 'Terraform', 'Node-RED', 'MQTT', 'OPC UA', 'WinCC', 'Mendix', 'Power BI', 'Grafana', 'Streamlit', 'Flask'],
    stats: [
      { k: T('3+ yrs', '3+ anos'), v: T('Feb 2021 to Jun 2024', 'de fev/2021 a jun/2024') },
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
        when: T('Jan - Jun 2024', 'jan - jun/2024'),
        items: [
          T('Client environments standardized on Docker Compose, with Node-RED as the central integration hub.', 'Ambientes de clientes padronizados em Docker Compose, com Node-RED como hub central de integração.'),
          T('Field IoT connectivity (MQTT, OPC UA) and CPU/memory tuning on edge devices running Debian and Yocto-based Linux, with Ubuntu on the servers.', 'Conectividade IoT em campo (MQTT, OPC UA) e ajuste de CPU/memória em edge com Debian e Linux baseado em Yocto, com Ubuntu nos servidores.'),
          T('Infra operations: PostgreSQL troubleshooting, backup, disaster recovery and Terraform.', 'Operação de infra: troubleshooting de PostgreSQL, backup, disaster recovery e Terraform.'),
          T('Time series with tslearn (clustering), Prophet and multivariate regression; first local-LLM agents with Ollama + CrewAI.', 'Séries temporais com tslearn (clustering), Prophet e regressão multivariada; primeiros agentes com LLM local (Ollama + CrewAI).'),
        ],
        stack: ['Docker Compose', 'Node-RED', 'MQTT', 'OPC UA', 'Terraform', 'tslearn', 'Prophet', 'Ollama', 'CrewAI'],
      },
    ],
  },
];
EXPERIENCE.forEach((x) => { if (x.periods) x.bullets = x.periods.flatMap((p) => p.bullets); });

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
  { group: T('Processing', 'Processamento'), icon: 'cpu', items: ['PySpark', 'Spark SQL', 'Delta Lake', 'Liquid Clustering', 'Polars', T('Advanced SQL', 'SQL avançado')] },
  { group: T('Databricks platform', 'Plataforma Databricks'), icon: 'disk', items: ['Unity Catalog', 'Workflows', 'Serverless', 'Asset Bundles', 'DLT', 'AI/BI Dashboards', 'Genie', 'Databricks Apps', 'System tables'] },
  { group: T('Ingestion and integration', 'Ingestão e integração'), icon: 'net', items: ['AWS DMS', 'OCI Data Integration', 'JDBC', 'REST/SOAP APIs', 'Kafka', 'Pub/Sub', 'Azure Service Bus', 'BigQuery (GA4)', 'Delta Sharing', 'Reverse ETL (HubSpot)'] },
  { group: T('Infra as code and DevOps', 'Infra como código e DevOps'), icon: 'gear', items: ['Terraform', 'GitHub Actions', 'Docker / Compose', 'Kubernetes', 'Linux (Fedora, Arch, Ubuntu, Debian, Yocto)', 'macOS (M4)'] },
  { group: 'Cloud', icon: 'cloud', items: ['AWS (DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM, EventBridge)', 'OCI', 'GCP (BigQuery, Dataflow, Pub/Sub, Composer)', 'Azure'] },
  { group: T('Governance and security', 'Governança e segurança'), icon: 'lock', items: [T('ABAC, masks and dynamic views', 'ABAC, masks e dynamic views'), 'Data Classification', 'Data contracts', 'PII / SHA-256', 'SSO / SAML', 'Security Analysis Tool', 'UCX'] },
  { group: 'Data quality', icon: 'check', items: ['Great Expectations', 'DQX', 'Elementary', 'dbt', 'pytest', 'SQLFluff'] },
  { group: 'FinOps', icon: 'coin', items: [T('Budgets and alerts', 'Budgets e alertas'), 'Cost dashboards', T('Cluster right-sizing', 'Right-sizing de clusters'), 'DynamoDB on-demand'] },
  { group: T('Databases', 'Bancos de dados'), icon: 'db', items: ['Oracle', 'SQL Server', 'PostgreSQL', 'MySQL', 'DynamoDB', 'MongoDB / DocumentDB', 'InfluxDB', 'Snowflake'] },
  { group: T('Orchestration', 'Orquestração'), icon: 'clock', items: ['Databricks Workflows', 'Apache Airflow / Cloud Composer', 'Lambda + EventBridge', 'dbt (scheduled groups)'] },
  { group: 'MLOps', icon: 'robot', items: ['MLflow (tracking, Model Registry)', 'MLOps Stacks', 'Asset Bundles', T('Feature tables', 'Feature tables'), T('Batch inference', 'Inferência em batch'), T('Multi-environment CI/CD', 'CI/CD multiambiente'), 'Vertex AI Workbench'] },
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
      'Portfolio returns and positions landed mid-afternoon and held up everything downstream, and a full daily reload was out of the question. The source recalculates a portfolio\'s whole interval when it is reprocessed, so I used its own reprocessing queue to define the window per portfolio, then delete and reinsert that interval (MERGE would be the wrong semantics, and this also carries deletes). 6.5B rows (~250 GB) stay current in D-1. Later I merged its 6 production workflows into 1 on serverless: -67% monthly cost, -92% in AWS.',
      'Rentabilidade e posições saíam no meio da tarde e travavam tudo que vinha depois, e uma carga completa diária era inviável. A origem recalcula o intervalo inteiro quando um portfólio é reprocessado, então usei a própria fila de reprocessamento para definir a janela por portfólio e depois apago e reinsiro esse intervalo (MERGE seria a semântica errada, e assim as exclusões também propagam). 6,5 bi de linhas (~250 GB) atualizadas em D-1. Depois juntei os 6 workflows de produção em 1, em serverless: -67% no custo mensal, -92% na AWS.',
    ),
    stack: ['AWS DMS', 'JDBC', 'OCI Data Integration', 'Delta Lake', 'Serverless', 'Terraform'],
  },
  {
    t: T('ML platform and MLOps', 'Plataforma de ML e MLOps'),
    big: 'dev → stg → prd',
    body: T(
      'Data Science had no environments and no path to production. I built it on Databricks: catalogs, buckets and a dedicated cluster per environment as code, MLOps Stacks as the project template, MLflow for tracking and GitHub Actions deploying through Asset Bundles, so a model goes from notebook to production the same way every time. The churn pipeline runs on it (extraction, feature engineering, batch inference with time-based validation). On the same governed platform: Vector Search over NPS data, and Genie for the whole company with per-user spend limits.',
      'Data Science não tinha ambientes nem caminho para produção. Construí no Databricks: catálogos, buckets e cluster dedicado por ambiente como código, MLOps Stacks como template, MLflow para tracking e GitHub Actions publicando via Asset Bundles, então um modelo vai do notebook para produção sempre do mesmo jeito. O pipeline de churn roda nela (extração, feature engineering, inferência em batch com validação temporal). Na mesma plataforma governada: Vector Search sobre dados de NPS, e o Genie para a empresa toda com limite de gasto por usuário.',
    ),
    stack: ['MLOps Stacks', 'MLflow', 'Asset Bundles', 'GitHub Actions', 'Vector Search', 'Genie', 'Terraform'],
  },
  {
    t: T('Ephemeral DMS ingestion', 'Ingestão com DMS efêmero'),
    big: T('6 sources · 210-task DAG', '6 origens · DAG de 210 tasks'),
    body: T(
      'About 50 Sinacor (Oracle) tables a day, up to 22M rows each, with PII kept apart. Each DMS step became a Databricks task: the job creates endpoints and instance, runs one DMS task per table, writes bronze and sensitive and deletes everything at the end. Terraform generates the DAG, a Lambda every 30 min removes forgotten instances and every task has an explicit timeout. You pay only for the load window, in exchange for more moving parts. Reused across 6 sources.',
      'Cerca de 50 tabelas do Sinacor (Oracle) por dia, até 22 milhões de linhas cada, com PII isolada. Cada etapa do DMS virou uma task do Databricks: o job cria endpoints e instância, roda uma task de DMS por tabela, grava em bronze e sensitive e apaga tudo no fim. O Terraform gera o DAG, uma Lambda a cada 30 min apaga instâncias esquecidas e toda task tem timeout explícito. Paga só a janela da carga, em troca de mais etapas. Reaproveitado em 6 origens.',
    ),
    stack: ['AWS DMS', 'Databricks Jobs', 'Lambda', 'Unity Catalog', 'Terraform'],
  },
  {
    t: T('Ganesha · intraday cash management', 'Ganesha · gestão de caixa intradiária'),
    big: T('every 20 min · 95%', 'a cada 20 min · 95%'),
    body: T(
      'During trading hours it consolidates client account balances, B3, fund and fixed-income settlements, TED/PIX transfers and the cash needed by booked orders. Treasury and Operations watch it on a liquidity dashboard (20+ users) with automatic balance alerts, so the day\'s cash need shows up in time. My part, co-leading with the tech lead: taking it from loose notebooks to production, an always-warm memory-optimized cluster, splitting the slow B3 query from TED/PIX, Delta auto-optimize/auto-compact for the dashboard, and keeping it running through source changes and the OCI migration. About 4,800 runs per quarter at 95% success.',
      'Durante o pregão, consolida os saldos em conta dos clientes, as liquidações em B3, fundos e renda fixa, as movimentações TED/PIX e a necessidade de caixa das operações boletadas. Tesouraria e Operações acompanham num painel de liquidez (mais de 20 usuários) com alertas automáticos de saldo, então a necessidade de caixa do dia aparece a tempo. Minha parte, coliderando com o líder técnico: levar de notebooks avulsos para produção, um cluster otimizado para memória sempre aquecido, separar a consulta lenta de B3 da de TED/PIX, auto-optimize/auto-compact nas tabelas Delta do painel e manter tudo rodando com mudanças nas fontes e a migração para a OCI. Cerca de 4.800 execuções por trimestre com 95% de sucesso.',
    ),
    stack: ['PySpark', 'Delta Lake', 'Workflows', 'AI/BI', 'GitHub', 'Sinacor', 'B3'],
  },
  {
    t: T('PII governance and access as code', 'Governança de PII e acesso como código'),
    big: T('150+ masked views', '150+ views mascaradas'),
    body: T(
      'PII arrived with every new source and access was solved case by case. Now raw data sits in a sensitive layer and the silver views swap it for a SHA-256 hash for anyone not privileged, so joins still work. Row filters use ABAC bound to tagged columns, so a new table without tags is never exposed. Grants, catalogs, schemas and views all live in Terraform (640+ commits), every access change is a reviewed pull request, and the recovery runbook from a past incident lives in the .tf itself.',
      'PII chegava junto com cada fonte nova e acesso era resolvido caso a caso. Hoje o dado bruto fica numa camada sensitive e as views da silver trocam o valor por hash SHA-256 para quem não é privilegiado, então o join continua funcionando. O filtro por linha usa ABAC ligado a colunas com tag, então tabela nova sem tag nunca fica exposta. Grants, catálogos, schemas e views vivem em Terraform (640+ commits), toda mudança de acesso é um pull request revisado, e o runbook de recuperação de um incidente antigo está escrito no próprio .tf.',
    ),
    stack: ['Unity Catalog', 'ABAC', 'Dynamic views', 'Data Classification', 'SAT', 'Terraform'],
  },
  {
    t: 'FinOps',
    big: T('~US$11k → ~US$3.4k/mo', '~US$11k → ~US$3,4k/mês'),
    body: T(
      'AWS bill from about US$11k to US$3.4k a month between Sep 2025 and Sep 2026 (-69%, ~US$7.6k a month less). What I did: breaking up heavy pipelines (DMS + single node, serverless by default; the portfolio management system went from US$317 to US$104 a month and from 6 workflows to 1, fee billing plus order management from US$199 to US$43), DynamoDB on-demand (US$105 → ≤US$5/mo), Nelogica from US$30 to US$6/day, an egress spike stopped, per-group budgets and a cost dashboard, plus reviewing and checking the storage cleanup (Glacier tiering and unused buckets).',
      'Fatura AWS de cerca de US$11k para US$3,4k por mês entre set/2025 e set/2026 (-69%, ~US$7,6k a menos por mês). O que eu fiz: quebrar pipelines pesados (DMS + single node, serverless por padrão; o sistema de consolidação de carteiras foi de US$317 para US$104 por mês e de 6 workflows para 1, tarifação e boletagem de US$199 para US$43), DynamoDB on-demand (US$105 → ≤US$5/mês), Nelogica de US$30 para US$6/dia, um pico de egress cortado, budgets por grupo e dashboard de custo, além de revisar e conferir a limpeza de storage (Glacier e buckets sem uso).',
    ),
    stack: ['System tables', 'Budgets', 'Serverless', 'DynamoDB', 'Terraform'],
  },
  {
    t: T('Market data: D-3 → D-1', 'Market data: de D-3 para D-1'),
    big: T('-80% daily cost', '-80% custo diário'),
    body: T(
      'The legacy B3 quotes pipeline took more than 24h and delivered in D-2 or D-3; some days the run did not even start because the previous one was still going, leaving gaps. I rewrote it in four versions: closing and intraday prices split, only relevant tickers kept from the start, duplicate and abnormal-growth checks (over 20% between runs), partitioned batches to Kafka. About 75% less runtime, 98-100% success.',
      'O pipeline legado de cotações da B3 levava mais de 24h e entregava em D-2 ou D-3; em alguns dias a execução nem começava porque a anterior ainda rodava, deixando buracos. Reescrevi em quatro versões: fechamentos separados dos preços correntes, só os tickers relevantes desde o início, checks de duplicidade e de crescimento anormal (mais de 20% entre execuções), envio ao Kafka em lotes particionados. Cerca de 75% menos tempo, com 98% a 100% de sucesso.',
    ),
    stack: ['PySpark', 'Kafka', 'Workflows', 'B3'],
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
];

// Itens da Lixeira: piadas que contam coisas reais
export const TRASH = [
  { n: T('legacy_datalake/', 'datalake_legado/'), d: T('Legacy workspace. Shut down in Jun 2026, with a Terraform backup.', 'Workspace legado. Desligado em jun/2026, com backup em Terraform.') },
  { n: 'portfolio_pipeline_19h.ipynb', d: T('The version that ran 12-19h. Replaced by the one that runs in ≤3h.', 'Versão que rodava 12-19h. Substituída pela que roda em ≤3h.') },
  { n: 'dynamodb_provisioned.tf', d: T('US$105/mo. Now on-demand, ~US$5/mo.', 'US$105/mês. Hoje on-demand, ~US$5/mês.') },
  { n: 'sinacor_history_120_columns.sql', d: T('Now 12 columns. From >3h to ~40 min.', 'Virou 12 colunas. De >3h para ~40 min.') },
  { n: 'mongo_full_reload.py', d: T('4h full reloads. Replaced by incremental JDBC upserts in 5 min.', 'Reload completo de 4h. Trocado por upserts incrementais JDBC em 5 min.') },
  { n: T('unused_buckets/', 'buckets_sem_uso/'), d: T('Moved to Glacier or deleted. Part of taking the AWS bill from ~US$11k to ~US$3.4k a month.', 'Foram para o Glacier ou apagados. Parte de levar a fatura AWS de ~US$11k para ~US$3,4k por mês.') },
  { n: 'contacts.ctt', d: T('Old contact list export. Everyone shows as Away now.', 'Lista de contatos antiga. Todo mundo aparece como Ausente agora.') },
  { n: 'GTASAsf1.b', d: T('Save at 100%. Kept only the lessons.', 'Save em 100%. Fiquei só com as lições.') },
  { n: 'giant_fee_billing_cluster.json', d: T('Fee billing engine moved to serverless: -87% AWS cost, -75% Databricks.', 'Sistema de tarifação passou para serverless: -87% no custo AWS, -75% no Databricks.') },
  { n: T('portfolio_system_x6_workflows/', 'carteiras_x6_workflows/'), d: T('Portfolio management system: six workflows (backup, incremental, positions, weekends...) turned into one. -92% AWS, -67% in total.', 'Sistema de consolidação de carteiras: seis workflows (backup, incremental, posições, fim de semana...) viraram um só. -92% na AWS, -67% no total.') },
  { n: 'order_mgmt_recreate_II.job', d: T('Order management and commissions: merged with 3 other jobs into one. -76% AWS from the peak.', 'Boletagem e comissionamento: juntado com outros 3 jobs num só. -76% na AWS desde o pico.') },
];

// Bloco de skills do currículo formatado (curado, para caber numa página)
export const RESUME_SKILLS = [
  [T('Languages', 'Linguagens'), 'Python, SQL, PySpark, HCL (Terraform), Java, Bash'],
  ['Data platform', 'Databricks (Unity Catalog, Workflows, Lakeflow, Serverless, System tables, Apps), Delta Lake, Apache Spark, Polars, dbt, Airflow'],
  [T('Cloud and IaC', 'Cloud e IaC'), 'AWS (DMS, S3, Lambda, Glue, Athena, DynamoDB, IAM), OCI, GCP (BigQuery, Dataflow, Pub/Sub, Composer), Azure, Terraform, GitHub Actions, Docker, Kubernetes'],
  [T('Governance and quality', 'Governança e qualidade'), 'ABAC, column masks, dynamic views, data contracts, PII/LGPD, Delta Sharing, Great Expectations, DQX, dbt tests, Elementary'],
  ['MLOps', T('MLflow (tracking, Model Registry), MLOps Stacks, Asset Bundles, feature tables, batch inference, multi-environment CI/CD (GitHub Actions)', 'MLflow (tracking, Model Registry), MLOps Stacks, Asset Bundles, feature tables, inferência em batch, CI/CD multiambiente (GitHub Actions)')],
  ['ML / GenAI', 'scikit-learn, XGBoost, LightGBM, tslearn, Prophet, PyTorch, Deep RL, Mosaic AI Vector Search, RAG, Genie'],
  [T('Databases', 'Bancos de dados'), 'Oracle, SQL Server, PostgreSQL, MySQL, DynamoDB, MongoDB, InfluxDB, Snowflake'],
];

// Projetos que entram no currículo formatado
export const RESUME_PROJECTS = [
  { t: 'turtlebot-sac-x-hybrid', d: T('ROS2 + Gazebo framework for DRL on TurtleBot3 (SAC, TD3, DDPG, SAC-X, SAC-XH); code behind the 2025 JIFS paper.', 'Framework ROS2 + Gazebo para DRL no TurtleBot3 (SAC, TD3, DDPG, SAC-X, SAC-XH); código do artigo de 2025 no JIFS.'), url: 'https://github.com/fabiodemo/turtlebot-sac-x-hybrid' },
  { t: 'data-pipeline-snowflake-dbt', d: T('Airflow DAG with incremental Postgres → Snowflake loads by max key, modeled in dbt.', 'DAG Airflow com cargas incrementais Postgres → Snowflake por max key, modeladas em dbt.'), url: 'https://github.com/fabiodemo/data-pipeline-snowflake-dbt' },
  { t: 'fastapi-kafka-postgres-weather', d: T('Streaming pipeline: NOAA API → Kafka → Postgres with FastAPI, on Docker Compose.', 'Pipeline de streaming: API NOAA → Kafka → Postgres com FastAPI, em Docker Compose.'), url: 'https://github.com/fabiodemo/fastapi-kafka-postgres-weather' },
];

// Estudos de caso (STAR) para o fórum
export const CASES = [
  {
    t: T('Ganesha: intraday cash that cannot stop', 'Ganesha: caixa intradiário que não pode parar'),
    s: T('In late 2024 the Data team joined a task force to give Operations and Treasury a view of cash during the day. The first version ran on loose notebooks over unstable sources (Sinacor, the production Metabase, the Cash Flow API and the order-booking APIs), and it had to run nonstop during trading hours.', 'No fim de 2024, o time de Dados entrou numa força-tarefa para dar a Operações e à Tesouraria uma visão de caixa ao longo do dia. A primeira versão rodava em notebooks avulsos sobre fontes instáveis (Sinacor, o Metabase de produção, a API de Cash Flow e as APIs de boletagem) e precisava rodar sem parar durante o pregão.'),
    k: T('With the tech lead, I owned the switch to production: bring the code up to the team\'s engineering standards and keep the continuous ingestion stable and cheap.', 'Dividi com o líder técnico a "virada de chave": levar o código para produção nos padrões de engenharia do time e garantir que a ingestão contínua fosse estável e com custo controlado.'),
    a: T('Moved the notebooks to GitHub and production workflows (Cash Flow API, B3, fund and fixed-income settlement tables). Compared instance families and picked memory-optimized for the all-day recurring runs. Found the bottleneck behind most failures: the B3 settlement query took 4+ minutes and held up the rest, so I split it from the TED/PIX task (about 1 minute). Kept it alive through source changes (a table removed from Metabase, network issues with Sinacor after the OCI migration) and tuned Delta auto-optimize/auto-compact for the dashboard.', 'Migrei os notebooks para GitHub e workflows de produção (API de Cash Flow, tabelas de liquidação de B3, fundos e renda fixa). Comparei famílias de instância e escolhi a otimizada para memória, pelas execuções recorrentes o dia todo. Achei o gargalo da maioria das falhas: a consulta de liquidações B3 levava 4+ minutos e travava o resto, então separei da task de TED/PIX (cerca de 1 minuto). Mantive o fluxo de pé com mudanças nas fontes (uma tabela removida do Metabase, problemas de rede com o Sinacor depois da migração para a OCI) e ajustei auto-optimize/auto-compact nas tabelas Delta do painel.'),
    r: T('Ganesha is a critical flow in production: every 20 minutes on every business day, about 4,800 runs per quarter at 95% success, and the main tool Treasury and Operations use to follow liquidity during the day (20+ dashboard users), with fewer failures and less manual work.', 'O Ganesha virou um fluxo crítico em produção: roda a cada 20 minutos em todos os dias úteis, cerca de 4.800 execuções por trimestre com 95% de sucesso, e é a principal ferramenta da Tesouraria e de Operações para acompanhar a liquidez ao longo do dia (painel com mais de 20 usuários), com menos falhas e menos intervenção manual.'),
  },
  {
    t: T('Infrastructure that lives and dies inside the job', 'Infraestrutura que nasce e morre dentro do job'),
    s: T('About 50 Oracle tables a day from Sinacor, B3\'s back office for brokers, some with 22M rows, had to land in the lake at a controlled cost and with PII isolated. A permanent DMS instance would be paid for 24 hours to work for a few.', 'Cerca de 50 tabelas Oracle por dia do Sinacor, o back office da B3 para corretoras, algumas com 22 milhões de linhas, precisavam chegar ao lake com custo controlado e PII isolada. Uma instância DMS fixa seria paga 24 horas para trabalhar algumas.'),
    a: T('Turned each DMS step into a Databricks task: the job creates the endpoints and the instance, runs one DMS task per table, writes bronze and sensitive and deletes everything at the end. Terraform generates the DAG (up to 210 tasks). Since more steps mean more ways to fail, every task got an explicit timeout and a Lambda runs every 30 minutes to delete forgotten instances.', 'Transformei cada etapa do DMS numa task do Databricks: o job cria endpoints e instância, roda uma task de DMS por tabela, grava em bronze e sensitive e apaga tudo no fim. O Terraform gera o DAG (até 210 tasks). Como mais etapas significam mais pontos de falha, toda task ganhou timeout explícito e uma Lambda roda a cada 30 minutos apagando instâncias esquecidas.'),
    r: T('Three jobs at 93-99% success, 170 objects in Unity Catalog, and the pattern reused across 5 more sources. Paying only for the load window became the default for database ingestion.', 'Três jobs com 93% a 99% de sucesso, 170 objetos no Unity Catalog e o padrão replicado em mais 5 origens. Pagar só a janela da carga virou o padrão para ingestão de banco.'),
  },
  {
    t: T('Why not MERGE: 6.5 billion rows in D-1', 'Por que não MERGE: 6,5 bilhões de linhas em D-1'),
    s: T('Positions and returns from the portfolio management system are recalculated at the source whenever a portfolio is reprocessed, sometimes for months back. A full daily reload was not viable.', 'Posições e rentabilidade do sistema de consolidação de carteiras são recalculadas na origem sempre que um portfólio é reprocessado, às vezes meses para trás. Carga completa diária era inviável.'),
    a: T('Used the source\'s own reprocessing queue to define the window per portfolio, then deleted and reinserted that interval and deduplicated. MERGE would be the wrong semantics: the source rewrites the whole interval, so replacing it is correct and also carries deletes.', 'Usei a própria fila de reprocessamento da origem para definir a janela por portfólio, depois apaguei e reinseri o intervalo e dedupliquei. MERGE seria a semântica errada: a origem reescreve o intervalo inteiro, então substituir é o certo e ainda propaga exclusões.'),
    r: T('5.0B + 1.6B rows (~250 GB) current in D-1 at 97% success. Later, 6 production workflows became 1 on serverless: -67% monthly cost, -92% in AWS.', '5,0 bi + 1,6 bi de linhas (~250 GB) atualizadas em D-1, com 97% de sucesso. Depois, 6 workflows de produção viraram 1 em serverless: -67% no custo mensal, -92% na AWS.'),
  },
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
    t: T('Fixing TLS without turning verification off', 'Consertar TLS sem desligar a verificação'),
    s: T('After the Sinacor server certificate was replaced, the integrations broke: the chain was incomplete and the connection used an IP while the certificate was issued for a hostname. The quick fix everyone reaches for is verify=False.', 'Depois da troca do certificado do servidor do Sinacor, as integrações quebraram: a cadeia estava incompleta e a conexão era por IP, com certificado emitido para hostname. O atalho que todo mundo usa é verify=False.'),
    a: T('Built the full chain (intermediate + root) and validated against the right hostname with a custom adapter, keeping verification on.', 'Montei a cadeia completa (intermediária + raiz) e validei contra o hostname certo com um adapter customizado, mantendo a verificação ligada.'),
    r: T('Integrations back without lowering security, and the fix became a documented pattern reused by other applications.', 'Integrações de volta sem baixar a segurança, e a solução virou padrão documentado e reaplicado em outras aplicações.'),
  },
  {
    t: T('Raising the whole team', 'Puxando o time inteiro'),
    s: T('Databricks shipped new features every month and the team had no routine to learn them.', 'O Databricks lançava features todo mês e o time não tinha rotina para aprender.'),
    a: T('Started a weekly knowledge exchange, shared more than 30 features as they shipped, built a bot for automated KPI reports and moved planning to weekly cycles.', 'Criei um knowledge exchange semanal, compartilhei mais de 30 features no lançamento, fiz um bot de relatórios automáticos de KPI e levei o planejamento para ciclos semanais.'),
    r: T('A standing learning routine; features like serverless performance mode went from a shared link to the team default.', 'Uma rotina fixa de aprendizado; features como o performance mode do serverless passaram de link compartilhado a padrão do time.'),
  },
];

// Página "Sobre mim" do blog (e pedaços no Sistema e no neofetch)
export const ABOUT = {
  interests: [
    T('<b>Linux and self-hosting:</b> rolling-release distros, tweaking the system until it is just right, running LLMs locally', '<b>Linux e self-hosting:</b> distros rolling, ajustar o sistema até ficar do jeito certo, rodar LLMs localmente'),
    T('<b>Robotics and AI</b>, especially reinforcement learning and agents', '<b>Robótica e IA</b>, principalmente aprendizado por reforço e agentes'),
    T('<b>Games:</b> from the Super Nintendo and its Brazilian clones (Polystation, One Station) to 2000s classics (PS1/PS2, MMOs, RTS) and today\'s indies, played on Linux', '<b>Games:</b> do Super Nintendo e suas réplicas (Polystation, One Station) aos clássicos dos anos 2000 (PS1/PS2, MMOs, RTS) e aos indies atuais, jogando no Linux'),
    T('<b>Hardware and DIY:</b> maintaining my own gear, basic mechanics, projects around the house', '<b>Hardware e DIY:</b> manutenção do próprio equipamento, mecânica básica, projetos em casa'),
    T('<b>Personal finance</b> and investing', '<b>Finanças pessoais</b> e investimentos'),
    T('<b>Exercise:</b> weight training, cycling, walking', '<b>Atividade física:</b> musculação, bike, caminhada'),
    T('<b>Road trips</b> to places with lots of nature and few people', '<b>Viagens de carro</b> para lugares com natureza e pouca gente'),
    T('<b>Languages and Latin American culture</b>, especially Argentina and Spanish', '<b>Idiomas e cultura latino-americana</b>, em especial Argentina e espanhol'),
  ],
  rigs: [
    { n: 'Desktop', os: 'Fedora Workstation · GNOME', parts: ['AMD Ryzen 5 1400', 'NVIDIA RTX 3060 12GB', '24GB RAM', T('NVMe SSD + HDD', 'SSD NVMe + HD')] },
    { n: T('Laptop', 'Notebook'), os: 'Arch Linux · KDE Plasma (Wayland)', parts: ['Intel Core i7-12700H', 'NVIDIA RTX 3050 4GB', '32GB RAM', T('512GB NVMe + extra 1TB NVMe', 'NVMe 512GB + NVMe extra de 1TB')] },
  ],
  trivia: [
    T('I teach robots to fend for themselves. Some of them learned.', 'Ensino robôs a se virarem sozinhos. Alguns aprenderam.'),
    T('I have published papers about things that move without anyone telling them to.', 'Tenho artigos publicados sobre coisas que andam sem ninguém precisar mandar.'),
    T('I once put a cloud bill on a serious diet. Nobody noticed the difference, except the invoice.', 'Já fiz uma conta de cloud emagrecer bastante sem ninguém perceber a diferença, só a fatura.'),
    T('I keep a small zoo of LLMs running at home.', 'Mantenho um pequeno zoológico de LLMs rodando em casa.'),
    T('I use Arch, and it still works.', 'Uso Arch, e ele ainda funciona.'),
    T('I have opened my laptop to replace the VRAM thermal paste. It survived, and so did I.', 'Já abri o notebook para trocar pasta térmica da VRAM. Ele sobreviveu, eu também.'),
    T('I started out in information security and data privacy, and the habit never left.', 'Comecei pela segurança da informação e privacidade de dados, e esse hábito nunca saiu.'),
    T('My first console was a clone with a creative name (Polystation, One Station). Ever since, I distrust hardware that promises too much.', 'Meu primeiro console foi uma réplica com nome criativo (Polystation, One Station). Desde então desconfio de hardware que promete demais.'),
    T('I grew up between Tibia, Mu Online and CS 1.6. That is where the grind and the patience come from.', 'Cresci entre Tibia, Mu Online e CS 1.6. Grind e paciência vêm daí.'),
    T('I am gaúcho, born near the Uruguay border: I speak little Spanish, but understand almost everything.', 'Sou gaúcho, nasci perto da fronteira com o Uruguai: falo espanhol pouco, mas entendo quase tudo.'),
    T('I used to paddle for the university. These days I paddle in pipelines.', 'Já remei pela universidade. Hoje remo em pipeline.'),
  ],
};

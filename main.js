const root = document.documentElement;
const savedTheme = localStorage.getItem('system-design-theme');
if (savedTheme) root.dataset.theme = savedTheme;
const updateToggles = () => document.querySelectorAll('.theme-toggle span').forEach((label) => { label.textContent = root.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode'; });
document.querySelectorAll('.theme-toggle').forEach((button) => button.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; localStorage.setItem('system-design-theme', root.dataset.theme); updateToggles(); }));
updateToggles();
document.querySelectorAll('.sidebar a[href="#kafka"], .sidebar a[href="index.html#kafka"]').forEach((link) => {
  link.href = 'kafka.html';
  if (location.pathname.endsWith('/kafka.html')) link.classList.add('active');
});
[
  ['#docker', 'index.html#docker', 'docker.html'],
  ['#kubernetes', 'index.html#kubernetes', 'kubernetes.html'],
].forEach(([homeHash, crossPageHash, page]) => {
  document.querySelectorAll(`.sidebar a[href="${homeHash}"], .sidebar a[href="${crossPageHash}"]`).forEach((link) => {
    link.href = page;
    if (location.pathname.endsWith(`/${page}`)) link.classList.add('active');
  });
});

const sidebarNav = document.querySelector('.sidebar nav');
if (sidebarNav) {
  const titles = [...sidebarNav.querySelectorAll(':scope > .nav-title')];
  const hldTitle = titles.find((title) => title.textContent.includes('HLD'));
  const lldTitle = titles.find((title) => title.textContent.includes('LLD'));
  const sectionNodes = (title) => {
    const nodes = [title];
    let next = title?.nextElementSibling;
    while (next && !next.classList.contains('nav-title')) { nodes.push(next); next = next.nextElementSibling; }
    return nodes;
  };
  const dsaTitle = document.createElement('p');
  dsaTitle.className = 'nav-title nav-title-spaced';
  dsaTitle.textContent = 'DSA Problem Solving';
  const dsaTopics = document.createElement('details');
  dsaTopics.open = true;
  dsaTopics.innerHTML = '<summary>Patterns</summary><a href="dsa-sliding-window.html">Sliding Window <span>↗</span></a>';
  const slidingWindowLink = dsaTopics.querySelector('a');
  if (location.pathname.endsWith('/dsa-sliding-window.html')) slidingWindowLink.classList.add('active');
  sidebarNav.replaceChildren(...sectionNodes(lldTitle), ...sectionNodes(hldTitle), dsaTitle, dsaTopics);
}
const menuButton = document.querySelector('.menu-button');
const sidebar = document.querySelector('#sidebar');
menuButton?.addEventListener('click', () => { const open = sidebar.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); menuButton.textContent = open ? '×' : '☰'; });
document.querySelectorAll('.sidebar a').forEach((link) => link.addEventListener('click', () => { sidebar.classList.remove('open'); menuButton?.setAttribute('aria-expanded', 'false'); if (menuButton) menuButton.textContent = '☰'; }));

const useCases = [...document.querySelectorAll('.sidebar details')].find((group) => group.querySelector('summary')?.textContent.trim() === 'Use cases');
if (useCases && !useCases.querySelector('[href="elasticsearch.html"]')) {
  const elasticsearchLink = document.createElement('a');
  elasticsearchLink.href = 'elasticsearch.html';
  elasticsearchLink.innerHTML = 'Elasticsearch <span>↗</span>';
  if (location.pathname.endsWith('/elasticsearch.html')) elasticsearchLink.classList.add('active');
  useCases.append(elasticsearchLink);
  elasticsearchLink.addEventListener('click', () => sidebar.classList.remove('open'));
}

if (location.pathname.endsWith('/elasticsearch.html')) {
  document.querySelector('.lead')?.insertAdjacentHTML('afterend', `
    <h2>Production architecture at a glance</h2>
    <div class="diagram" role="img" aria-label="Production Elasticsearch architecture from an authoritative source through indexing and data nodes, with clients querying coordinating nodes and snapshots sent to object storage.">
      <div class="node client">Primary DB / event stream<small>authoritative changes</small></div>
      <div class="arrow">→<small>bulk ingest</small></div>
      <div class="node api">Indexing service<small>validate + transform</small></div>
      <div class="arrow">→<small>write route</small></div>
      <div class="node db">Data nodes<small>primaries + replicas</small></div>
      <div class="upload-line"><span>Clients → load balancer → coordinating nodes → data-node shard copies; three dedicated cluster managers maintain cluster state</span><i>⇢</i></div>
      <div class="node storage">Snapshot storage<small>backup + recovery</small></div>
    </div>
  `);
}

if (location.pathname.endsWith('/kubernetes.html')) {
  document.querySelector('.diagram')?.insertAdjacentHTML('afterend', `
    <h2>Example: multiple services deployed on OCI Kubernetes Engine</h2>
    <p>The VCN is the private network boundary—not a container for every OCI service. Your OKE nodes, Pods, private load balancers, and private endpoints are VCN-attached. Data Flow, Object Storage, OCIR, and other managed services are regional services reached through a Service Gateway, private endpoint, or (when needed) NAT gateway.</p>
    <div class="challenge-grid" role="img" aria-label="Corrected OCI deployment architecture: VCN-attached OKE networking and regional OCI managed services connected through private access.">
      <div><b>OCI Region</b><span>Contains both the customer VCN and regional OCI managed services.</span></div>
      <div><b>Private VCN</b><span>Subnets, NSGs, route tables, DNS, Service Gateway, private endpoints, and optional NAT.</span></div>
      <div><b>OKE API endpoint subnet</b><span>Private Kubernetes API endpoint; Oracle manages the underlying control plane.</span></div>
      <div><b>Worker-node + Pod subnets</b><span>Node pools and VCN-native Pod IPs run the application namespace.</span></div>
      <div><b>Application Deployments</b><span>Metrics Provider, Search, Indexer, Extension, Integration, Notification/Base-code, and Extension ML; ClusterIP services provide private port-8080 discovery.</span></div>
      <div><b>ConfigMaps + Secrets</b><span>Kubernetes objects mounted into Pods: config, database wallet/credentials, and OpenSearch certificates.</span></div>
      <div><b>OCI regional services</b><span>Data Flow Spark jobs, Object Storage, OCIR, and managed OpenSearch are accessed from the VCN, not placed inside it.</span></div>
      <div><b>Database + Kafka</b><span>Can be VCN-attached when self-managed/private, or regional managed services exposed through private access.</span></div>
      <div><b>Private service access</b><span>Service Gateway/private endpoints keep supported OCI-service traffic off the public internet; NAT is outbound-only when required.</span></div>
    </div>
    <pre><code>OCI Tenancy
└─ OCI Region
   ├─ Customer VCN (private network boundary)
   │  ├─ Private API-endpoint subnet → OKE Kubernetes API endpoint
   │  ├─ Private worker-node subnet → OKE node pools
   │  ├─ Private Pod subnet → application namespace
   │  │  ├─ Metrics Provider Deployment → Pods → ClusterIP :8080
   │  │  ├─ Search, Indexer, Extension, Integration Deployments
   │  │  └─ Notification/Base-code + Extension ML Deployments
   │  ├─ Optional private load-balancer subnet → Ingress / Service LoadBalancer
   │  └─ NSGs + route tables + DNS + Service Gateway / private endpoints / NAT
   │
   └─ Regional OCI managed services (reached from the VCN)
      ├─ OCI Data Flow → on-demand consumption Spark run
      ├─ Object Storage → Parquet input, Spark artifacts, logs
      ├─ OCIR → images pulled by OKE Pods
      ├─ Managed OpenSearch → searchable usage, plans, products, rate cards
      └─ Oracle Database / Kafka → private VCN-attached or managed private access</code></pre>
  `);
}

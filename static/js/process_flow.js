/**
 * Process Flow Page - Dynamic loading of Process Flow Steps
 * Fetches the glossary OWL and extracts terms that have a dct:relation.
 */

(function() {
  'use strict';

  const GLOSSARY_URL = 'https://raw.githubusercontent.com/VHP4Safety/glossary/refs/heads/main/glossary.owl';
  const GLOSSARY_SITE = 'https://glossary.vhp4safety.nl/';

  // ── Parsing ────────────────────────────────────────────────────────────────

  function parseTermsWithRelations(turtleText) {
    const rx = /<([^>]+)>\s*\n([\s\S]*?)(?=\n<|$)/g;
    const prop = (block, p) => { const m = block.match(p); return m ? m[1].trim() : ''; };
    const terms = [];
    let m;

    while ((m = rx.exec(turtleText)) !== null) {
      const [, uri, block] = m;
      if (!block.includes('rdf:type') || !block.includes('owl:Class')) continue;

      const label = prop(block, /rdfs:label\s+"([^"]+)"(?:@[a-zA-Z-]+)?/);
      if (!label || label === 'nan' || label.length < 2) continue;

      const relMatch = block.match(/dct:relation\s+<([^>]+)>/);
      if (!relMatch) continue; // only keep terms with a relation

      terms.push({
        uri,
        label,
        definition: prop(block, /dc:description\s+"([^"]+)"(?:@[a-zA-Z-]+)?/),
        relation: relMatch[1].trim(),
      });
    }
    return terms;
  }

  /**
   * Extract the VHP ID from a URI
   */
  function getVHPId(uri) {
    if (uri?.includes('#')) {
      return uri.split('#')[1];
    }
    return '';
  }

  /**
   * Create accordion item HTML
   */
  function createAccordionItem(term, index) {
    const collapseId = `about-collapse${index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : index === 4 ? 'Five' : index + 1}`;
    const headingId = `about-heading${index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : index === 4 ? 'Five' : index + 1}`;
    
    // Clean label - remove "(Process Flow Step)" suffix if present
    const cleanLabel = term.label.replace(/\s*\(Process Flow Step\)\s*$/i, '').trim();
    
    return `
  <div class="accordion-item">
    <h2 class="accordion-header" id="${headingId}">
        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
          ${cleanLabel}
        </button>
      </h2>
      <div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
        <div class="accordion-body"  style="text-align: justify;">
          <p>
            ${term.definition || 'No definition available.'}
          </p>
        </div>
      </div>
  </div>`;
  }

  /**
   * Load and render process flow steps
   */
  async function loadProcessFlowSteps() {
    const container = document.getElementById('process-flow-accordion');
    if (!container) {
      console.warn('[Process Flow] Accordion container not found');
      return;
    }

    // Show loading state
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';

    try {
      const resp = await fetch(GLOSSARY_URL);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const terms = parseTermsWithRelations(await resp.text());
      
      if (terms.length === 0) {
        container.innerHTML = '<p class="text-muted">No process flow steps found.</p>';
        return;
      }

      console.log('[Process Flow] Loaded', terms.length, 'process flow steps');

      // Generate accordion HTML
      const accordionHtml = terms
        .map((term, index) => createAccordionItem(term, index))
        .join('');

      container.innerHTML = accordionHtml;

    } catch (error) {
      console.error('[Process Flow] Error loading steps:', error);
      container.innerHTML = `
        <div class="alert alert-warning" role="alert">
          <strong>Unable to load process flow steps.</strong><br>
          Please try refreshing the page or check back later.
        </div>
      `;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProcessFlowSteps);
  } else {
    loadProcessFlowSteps();
  }

})();

function updatePillStyles(selector, dataAttr, activeVal) {
      document.querySelectorAll(selector).forEach(btn => {
        const isSelected = btn.dataset[dataAttr] === activeVal;
        btn.className = isSelected
          ? `${selector.replace('.', '')} px-2.5 py-1 rounded-full text-xs font-semibold bg-emeraldPulse/20 text-emeraldPulse border border-emeraldPulse/50 transition cursor-pointer`
          : `${selector.replace('.', '')} px-2.5 py-1 rounded-full text-xs font-medium bg-obsidian text-gray-400 border border-borderDark hover:border-gray-500 transition cursor-pointer`;
      });
    }

    function setActiveMatrixHighlight(techIds, label) {
      state.activeHighlightTechs = Array.isArray(techIds) ? techIds : [techIds];
      state.activeHighlightLabel = label || state.activeHighlightTechs.join(', ');

      const pill = document.getElementById('active-selection-pill');
      const labelEl = document.getElementById('active-selection-label');
      if (pill && labelEl) {
        labelEl.textContent = state.activeHighlightLabel;
        pill.classList.remove('hidden');
        pill.classList.add('inline-flex');
      }
      renderMatrix();
    }

    function clearActiveSelection(reRender = true) {
      state.activeHighlightTechs = null;
      state.activeHighlightLabel = '';
      const pill = document.getElementById('active-selection-pill');
      if (pill) {
        pill.classList.add('hidden');
        pill.classList.remove('inline-flex');
      }
      if (reRender) renderMatrix();
    }

    function showDrawer() {
      const backdrop = document.getElementById('inspector-backdrop');
      const drawer = document.getElementById('inspector-drawer');
      if (!backdrop || !drawer) return;
      backdrop.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        drawer.classList.remove('translate-x-full');
      });
    }

    function closeInspector() {
      const backdrop = document.getElementById('inspector-backdrop');
      const drawer = document.getElementById('inspector-drawer');
      if (!backdrop || !drawer) return;
      backdrop.classList.add('opacity-0');
      drawer.classList.add('translate-x-full');
      setTimeout(() => {
        backdrop.classList.add('hidden');
      }, 280);
    }

    function renderMitigationBlocks(mitigations) {
      if (!mitigations) return '';
      return `
        <div class="space-y-2.5 pt-2 border-t border-borderDark">
          <h3 class="text-xs font-semibold uppercase tracking-wider text-cyanAlert">Actionable Controls &amp; UK Regulatory Alignment</h3>
          <div class="p-3 rounded-xl bg-obsidian border border-emeraldPulse/30 text-xs">
            <div class="font-mono font-bold text-emeraldPulse mb-1">NCSC UK / Cyber Essentials SLA</div>
            <p class="text-gray-300 leading-relaxed">${mitigations.ncscSla}</p>
          </div>
          <div class="p-3 rounded-xl bg-obsidian border border-cyanAlert/30 text-xs">
            <div class="font-mono font-bold text-cyanAlert mb-1">Microsoft Defender / Entra / Intune</div>
            <p class="text-gray-300 leading-relaxed">${mitigations.defender}</p>
          </div>
          <div class="p-3 rounded-xl bg-obsidian border border-talosIndigo/40 text-xs">
            <div class="font-mono font-bold text-indigo-300 mb-1">Cisco Snort 3 / Secure Network</div>
            <p class="text-gray-300 leading-relaxed">${mitigations.snort}</p>
          </div>
          <div class="p-3 rounded-xl bg-obsidian border border-amberAlert/30 text-xs">
            <div class="font-mono font-bold text-amberAlert mb-1">GRC &amp; Compliance (FCA SYSC / ISO 27001)</div>
            <p class="text-gray-300 leading-relaxed">${mitigations.grc}</p>
          </div>
        </div>
      `;
    }

    function openTechniqueInspector(techId) {
      const tech = TECHNIQUES_V20.find(t => t.id === techId);
      if (!tech) return;

      const tac = TACTICS_V20.find(t => t.id === tech.tactic);
      const linkedCves = CVE_REGISTER.filter(c => c.techniques.includes(tech.id));
      const linkedIntel = INTEL_FEED.filter(i => i.techniques.includes(tech.id));

      setActiveMatrixHighlight([tech.id], `${tech.id}: ${tech.name}`);

      document.getElementById('insp-badges').innerHTML = `
        <span class="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-emeraldPulse/15 text-emeraldPulse border border-emeraldPulse/40">${tech.id}</span>
        ${tac ? `<span class="px-2.5 py-0.5 rounded font-mono text-xs bg-slateSurface text-gray-200 border border-borderDark">${tac.id} • ${tac.name}</span>` : ''}
        ${tech.isV20New ? `<span class="px-2.5 py-0.5 rounded font-mono text-xs bg-purple-500/20 text-purple-300 border border-purple-500/40">ATT&amp;CK v20.1</span>` : ''}
      `;
      document.getElementById('insp-title').textContent = tech.name;
      document.getElementById('insp-subtitle').textContent = `Attribution: ${tech.sources.join(' • ')} | Sectors: ${tech.sectors.join(', ')}`;

      document.getElementById('insp-body').innerHTML = `
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Technique Telemetry &amp; 2026 Threat Context</h3>
          <p class="text-xs sm:text-sm text-gray-200 leading-relaxed bg-obsidian p-4 rounded-xl border border-borderDark">${tech.description}</p>
        </div>

        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-amberAlert mb-1.5">Detection Engineering &amp; Data Sources</h3>
          <div class="bg-obsidian p-3.5 rounded-xl border border-amberAlert/30 font-mono text-xs text-gray-200 leading-relaxed">${tech.detection}</div>
        </div>

        ${linkedIntel.length ? `
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-rose-300 mb-1.5">UK Cyber News &amp; CTI Stories Using ${tech.id} (${linkedIntel.length})</h3>
            <div class="space-y-2">
              ${linkedIntel.map(item => `
                <div onclick="openIntelInspector('${item.id}')" class="p-3 rounded-xl bg-obsidian hover:bg-slateSurface border border-borderDark cursor-pointer transition">
                  <div class="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span class="text-rose-300 font-bold">${item.outlet || item.source}</span>
                    <span>${item.date}</span>
                  </div>
                  <div class="text-xs font-bold text-white">${item.title}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${linkedCves.length ? `
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-crimsonAlert mb-1.5">Linked CVEs Exploiting ${tech.id} (${linkedCves.length})</h3>
            <div class="space-y-2">
              ${linkedCves.map(c => `
                <div onclick="openCveInspector('${c.cveId}')" class="p-3 rounded-xl bg-obsidian hover:bg-slateSurface border border-borderDark cursor-pointer flex justify-between items-center transition">
                  <span class="font-mono text-xs font-bold text-white">${c.cveId} — ${c.alias}</span>
                  <span class="font-mono text-xs text-crimsonAlert font-bold">CVSS ${c.cvss.toFixed(1)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${renderMitigationBlocks(tech.mitigations)}
      `;

      document.getElementById('insp-copy-btn').onclick = () =>
        copyBrief(`[MITRE ATT&CK ${tech.id} - ${tech.name}]\n${tech.description}\nDetection: ${tech.detection}\nNCSC SLA: ${tech.mitigations.ncscSla}`);
      showDrawer();
    }
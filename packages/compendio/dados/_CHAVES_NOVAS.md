# _CHAVES_NOVAS.md — chaves de `capacidade` inventadas

> Toda chave NOVA de `capacidade` criada ao enriquecer `efeitos[]` é anexada aqui:
> **id do poder · chave · uma frase do significado**. Antes de inventar uma chave, conferir
> esta lista para não dar dois nomes ao mesmo conceito. Padrão de nome: `verbo_objeto`.
> O humano consolida em lote.

| chave | significado | de onde veio |
|-------|-------------|--------------|
| `ignora_terreno_dificil` | terreno difícil não reduz deslocamento nem impede investida | `acrobatico` |
| `respira_submerso` | pode respirar embaixo d'água | `anfibio` |
| `ignora_dano_critico_furtivo` | % de chance de ignorar o dano adicional de crítico/furtivo | `anatomia-insana` (do exemplo-ouro `efeitos.ts`) |
| `resistencia_efeitos_tormenta` | +X em testes de resistência contra efeitos da Tormenta (condição não rastreável → lembrete) | `afinidade-com-a-tormenta` |
| `primeiro_poder_tormenta_sem_perda_carisma` | o primeiro poder da Tormenta não conta para perda de Carisma | `afinidade-com-a-tormenta` |
| `bonus_pericias_carisma_contra_atraidos` | +X em perícias de Carisma contra quem possa se sentir atraído (condição não rastreável → lembrete) | `atraente` |
| `executa_manobra_ao_acertar` | ao acertar ataque (gastando PM), executa derrubar/empurrar como ação livre | `ataque-pesado` |
| `realiza_ataque_extra_escudo` | 1×/rodada, gasta PM para um ataque corpo a corpo extra com o escudo | `ataque-com-escudo` |
| `anula_penalidade_dano_nao_letal` | suprime a penalidade de −5 no acerto ao atacar para causar dano não letal (a penalidade é opção de ataque do app; o poder só a desliga) | `ataque-piedoso` |
| `garante_sucesso_pericia_em_19` | em testes de perícia, resultado 19+ no dado é sempre sucesso, independe da CD | `almejar-o-impossivel` |
| `impoe_teste_vontade_no_primeiro_atacante` | 1ª criatura inteligente que te atacar na cena faz Vontade (CD Car) ou perde a ação (1×/cena) | `aparencia-inofensiva` |
| `permite_arma_secundaria_uma_mao` | com Estilo de Duas Armas, permite arma de uma mão na mão secundária (normalmente teria de ser leve) | `arma-secundaria-grande` |
| `realiza_arremesso_extra` | 1×/rodada, gasta PM para um ataque adicional com arma de arremesso contra o mesmo alvo | `arremesso-multiplo` |
| `permite_ataque_poderoso_com_arremesso` | se possui Ataque Poderoso, pode aplicá-lo a armas de arremesso | `arremesso-potente` |
| `aura_medo_inimigos` | aura ativável (9m) que força inimigos a Vontade (CD Car) ou ficarem abalados até o fim da cena | `aura-de-medo` |
| `aura_paz_inimigos_hostis` | aura ativável que força inimigos com ação hostil a Vontade (CD Car) ou perder a ação | `aura-de-paz` |
| `bonus_cura_por_dado` | efeitos de cura do portador e aliados próximos recuperam +X PV por dado de cura | `aura-restauradora` |
| `move_apos_ataque_investida_montada` | numa investida montada, pode continuar se movendo em linha reta após o ataque (limite: dobro do deslocamento) | `carga-de-cavalaria` |
| `custo_ritual_tempo_e_dinheiro` | lançar como ritual muda execução p/ 1 hora e exige T$ 10 por PM gasto em materiais | `celebrar-ritual` |
| `ritual_nao_armazenavel_em_item` | magias lançadas como ritual não podem ser armazenadas em itens | `celebrar-ritual` |

> ⚠️ Drift de nomenclatura (Lote 5, Sonnet): `aura_medo_inimigos`, `aura_paz_inimigos_hostis`,
> `bonus_cura_por_dado`, `custo_ritual_tempo_e_dinheiro`, `ritual_nao_armazenavel_em_item` nasceram
> substantivo-primeiro, não `verbo_objeto`. Mantidas iguais ao JSON; consolidar nomes depois.

### Lote magias (GRUPO 2) — chaves novas (livro-basico/magias/)
| `cria_terreno_dificil_e_camuflagem_leve_na_area` | escombros viram terreno difícil + camuflagem leve na área | `chuva-de-meteoros` |
| `nao_pode_mentir_deliberadamente` | impede mentira deliberada (mas permite evasivas/omissões) | `circulo-da-justica` |
| `restaura_1_pm_por_turno_no_circulo` | quem termina o turno no círculo recupera 1 PM, máx. 5/dia | `circulo-da-restauracao` |
| `dano_a_mortos_vivos_por_luz_na_area` | mortos-vivos/vulneráveis a luz perdem PV e PM em vez de recuperar | `circulo-da-restauracao` |
| `dano_aumentado_contra_mortos_vivos` | dano contra mortos-vivos usa um dado maior que o normal (ver prosa) | `colera-de-azgher` |
| `forca_alvo_obedecer_comando_escolhido` | alvo obedece a uma ordem (fugir/largar/parar/sentar/vir) na resistência falha | `comando` |
| `entende_qualquer_idioma_e_le_pensamentos` | compreende texto/fala e pode ouvir pensamentos de criatura tocada | `compreensao` |
| `concede_dados_auxilio_pericia_area_natural` | pool de dados gastável como bônus em perícias em áreas naturais | `comunhao-com-a-natureza` |
| `concede_lancar_magia_ate_2_circulo_sem_custo_para_alvo` | outra criatura pode lançar 1 magia até 2º círculo sem pagar PM | `conceder-milagre` |
| `rola_dois_dados_ataque_usa_melhor` | ao atacar, rola dois dados e fica com o melhor resultado | `concentracao-de-combate` |
| `monitora_status_criaturas_tocadas` | sabe posição/PV/condições/magias afetando os alvos tocados | `condicao` |
| `invoca_elemental_parceiro_grande` | invoca elemental Grande que age como parceiro (destruidor + outro tipo) | `conjurar-elemental` |
| `invoca_monstro_conjurado` | invoca monstro Pequeno com stats fixos e ordens (mover/atacar/lançar magia) | `conjurar-monstro` |
| `invoca_seis_esqueletos_capangas` | invoca 6 esqueletos (ou variantes) com stats fixos e imunidades | `conjurar-mortos-vivos` |
| `maximiza_cura_e_dano_de_luz_na_area` | cura e dano de efeitos de luz na área são maximizados | `consagrar` |
| `concede_dados_auxilio_pericia_com_risco_pm` | pool de dados gastável em qualquer perícia, com risco de perder PM em certos resultados | `contato-extraplanar` |
| `inverte_gravidade_area` | inverte gravidade da área (modo "Inverter") | `controlar-a-gravidade` |
| `reduz_gravidade_area` | reduz gravidade da área, concedendo voo lento e bônus em Atletismo (modo "Reduzir") | `controlar-a-gravidade` |
| `eleva_ou_reduz_nivel_agua_e_afeta_elementais` | eleva/reduz nível de água mundana e afeta elementais da água (modos Enchente/Partir) | `controlar-agua` |
| `esquenta_extingue_ou_modela_chama` | esquenta objeto, extingue chama (cria fumaça) ou modela/move chama existente | `controlar-fogo` |
| `fortalece_modela_repele_ou_retorce_madeira` | fortalece, modela, repele ou retorce um objeto de madeira | `controlar-madeira` |
| `controla_clima_da_area` | muda a condição climática de uma grande área | `controlar-o-clima` |
| `manipula_o_tempo_congela_salta_ou_reverte` | congela o tempo ao seu redor, salta no tempo ou reverte a última rodada | `controlar-o-tempo` |
| `planta_enreda_criaturas_na_area` | vegetação tenta enredar criaturas na área a cada rodada (Reflexos anula) | `controlar-plantas` |
| `cria_terreno_dificil_na_area` | área afetada vira terreno difícil | `controlar-plantas` |
| `modela_ou_solidifica_terra_pedra` | modela terra/pedra em objetos ou solidifica lama/areia | `controlar-terra` |
| `teleporta_objeto_marcado_para_maos` | teletransporta objeto com runa pessoal previamente marcada para a mão do conjurador | `convocacao-instantanea` |
| `cria_pequena_porcao_de_elemento` | cria pequena porção de água, ar, fogo ou terra (mundana) | `criar-elementos` |
| `cria_ilusao_visual_ou_sonora_simples` | cria imagem ou som ilusório simples, sem causar/sofrer dano | `criar-ilusao` |
| `impede_aproximacao_de_tipo_de_criatura_escolhido` | cúpula impede criaturas de um tipo/raça escolhido de se aproximarem (Vontade anula) | `cupula-de-repulsao` |
| `torna_itens_magicos_mundanos_na_area` | itens mágicos (exceto artefatos) na área viram mundanos por um dia | `deflagracao-de-mana` |
| `modifica_a_realidade_efeitos_arbitrarios` | permite efeitos arbitrários de alta magia (dissipar, transportar, refazer teste, criar item, duplicar magia, +1 atributo) | `desejo` |

### Reprocessamento pós-aditivos (saídas da quarentena)
| `causa_dano_trevas_no_toque` | toque corpo a corpo causa 2d6 de dano de trevas (Fort CD Sab reduz à metade) | `caricia-sombria` |
| `produz_arma_organica_temporaria` | gasta ação de movimento + PM p/ criar versão orgânica de uma arma proficiente, dura a cena | `armamento-aberrante` |
| `aposta_resultado_oculto_do_mestre` | gasta PM p/ rolar 1d20 oculto do mestre e escolher entre o próprio resultado e o dele (mecânica de mesa, mediada pelo mestre) | `apostar-com-o-trapaceiro` |

> Removidas (deixaram de ser capacidade pós-aditivos):
> `recupera_pv_metade_do_dano_causado` → virou `pos_dano` em `pv.atual` (`expr: floor(dano_causado/2)`);
> `aumenta_passo_dano_por_poderes_tormenta` → virou `bonus` em `dano` com `dados.passo` (expr).

### Lote-piloto (Sonnet 6×5) — chaves novas
| `aprende_magia_circulo_1` | aprende/pode lançar uma magia (arcana ou divina) de 1º círculo à escolha | `centelha-magica` |
| `concede_bonus_pericias_aliados` | concede +1 em perícias a ALIADOS próximos (motor não rastreia stats de terceiros) | `comandar` |
| `conjura_arma_magica_temporaria` | cria arma mágica proficiente na mão; dura a cena | `conjurar-arma` |
| `imune_efeitos_medo` | imune a efeitos de medo (não cobre fobias raciais) | `coragem-total` |
| `aumenta_limite_carga` | aumenta o limite de espaços de carga | `costas-largas` |
| `slot_item_vestido_extra` | permite um item vestido adicional além do limite | `costas-largas` |
| `soma_carisma_a_cura_magica` | soma Carisma ao PV restaurado pelos próprios efeitos de cura (falta ALVO `bonus_cura_magica`) | `cura-gentil` |
| `escolhe_10_em_cura` | pode optar pelo resultado 10 em testes de Cura | `curandeira-perfeita` |
| `ignora_penalidade_cura_sem_maleta` | não sofre a penalidade de usar Cura sem maleta | `curandeira-perfeita` |
| `cria_enxame_insetos_rubros` | invoca enxame que causa 2d6 ácido/turno, sustentado | `cuspir-enxame` |
| `aprende_magia_controlar_plantas` | recebe acesso à magia Controlar Plantas | `dedo-verde` |
| `possui_arma_natural_mordida` | possui arma natural de mordida (1d4) sempre disponível | `dentes-afiados` |
| `ataque_extra_mordida_ao_agredir` | 1×/rodada, ataque extra com a mordida ao agredir | `dentes-afiados` |
| `ataque_extra_apos_derrubar` | ataque extra contra criatura recém-derrubada | `derrubar-aprimorado` |
| `arremessa_arma_desarmada` | após desarmar, arremessa a arma da criatura (direção/distância aleatórias) | `desarmar-aprimorado` |
| `dorme_ao_relento_conta_como_confortavel` | dormir ao relento conta como descanso confortável | `descanso-natural` |
| `chance_falha_efeitos_contra_voce` | % de chance de falha em efeitos contra você (enquanto ativo) | `desprezar-a-realidade` |
| `ignora_penalidade_disparo_em_combate` | anula a penalidade de disparar contra alvo em combate corpo a corpo | `disparo-preciso` |
| `ataque_adicional_disparo_com_penalidade` | ataque de disparo adicional com penalidade até o próximo turno | `disparo-rapido` |
| `imune_alquebrado_esmorecido_frustrado` | imune às condições alquebrado, esmorecido e frustrado | `dom-da-esperanca` |
| `ressuscita_apos_morte` | volta à vida após 3d6 dias quando morre | `dom-da-imortalidade` |
| `pode_lancar_augurio` | pode lançar a magia Augúrio | `dom-da-profecia` |
| `gasta_pm_bonus_teste_livre` | gasta 2 PM para +2 em qualquer teste (escolha livre) | `dom-da-profecia` |
| `ressuscita_criatura_morta` | ressuscita criatura morta há menos de 1 ano (1×/criatura) | `dom-da-ressurreicao` |
| `bonus_percepcao_contra_enganacao_furtividade` | +5 Percepção contra Enganação/Furtividade (condição de mesa) | `dom-da-verdade` |
| `reduz_penalidade_arma_maior` | a penalidade de usar arma de tamanho maior cai de −5 para −2 (remoção de regra → regra 12) | `empunhadura-poderosa` |
| `fabrica_pergaminhos` | usa Ofício para fabricar pergaminhos com magias conhecidas | `escrever-pergaminho` |

> ⚠️ Drift de nomenclatura (vários nasceram substantivo-primeiro: `imune_*`, `chance_falha_*`,
> `bonus_percepcao_*`, `slot_item_*`). Mantidos iguais ao JSON; consolidar verbo_objeto depois.

### Lote 7 (Sonnet 6×5) — chaves novas
| `ataca_alvos_adjacentes_com_arma_longa` | arma alongada pode atacar criaturas adjacentes | `estilo-de-arma-longa` |
| `saca_arma_arremesso_acao_livre` | saca armas de arremesso como ação livre | `estilo-de-arremesso` |
| `bonus_ataque_arremesso_com_saque_rapido` | se possui Saque Rápido, +2 ataque com arremesso | `estilo-de-arremesso` |
| `ataque_duplo_duas_armas` | empunhando duas armas (uma leve), dois ataques na ação agredir | `estilo-de-duas-armas` |
| `exclui_ataque_desarmado_do_bonus` | o +2 ataque do estilo não vale p/ ataque desarmado | `estilo-de-uma-arma` |
| `possui_familiar_cobra` | possui um familiar cobra | `familiar-ofidico` |
| `familiar_nao_conta_limite_parceiros` | o familiar cobra não ocupa slot de parceiro | `familiar-ofidico` |
| `ignora_penalidade_deslocamento_armadura_pesada` | armadura pesada não reduz deslocamento | `fanatico` |
| `aprende_magia_criar_ilusao` | aprende/lança Criar Ilusão | `farsa-do-fingidor` |
| `substitui_pericia_por_guerra_em_combate` | gasta 2 PM p/ trocar um teste de perícia por Guerra | `fe-guerreira` |
| `finta_como_acao_de_movimento` | finta vira ação de movimento | `finta-aprimorada` |
| `rola_vantagem_pericia` | gasta 1 PM p/ rolar 2 dados e usar o melhor na perícia parametrizada | `foco-em-pericia` |
| `absorve_pm_temporario_ao_resistir_magia` | +1 PM temp ao resistir magia (teto = contagem.poderes.tormenta) | `fome-de-mana` |
| `absorve_pm_temporario_inimigo_falha_vontade` | +1 PM temp quando inimigo falha Vontade contra sua magia (teto = atr.sab) | `extase-da-loucura` |
| `penalidade_manobras_tamanho_minusculo` | −5 em manobras enquanto Minúsculo (forma de macaco) | `forma-de-macaco` |
| `deslocamento_escalar_9m` | deslocamento de escalar 9m enquanto transformado | `forma-de-macaco` |
| `equipamento_some_na_transformacao` | equipamento desaparece durante a transformação | `forma-de-macaco` |
| `reducao_dano_frio_trevas_5` | redução de dano de frio e trevas 5 | `fulgor-solar` |
| `emite_clarao_ofusca_atacante` | reação (1 PM): clarão ofusca o atacante | `fulgor-solar` |
| `proibe_acoes_paciencia_concentracao` | enquanto ativo, não pode agir com paciência/concentração | `furia-divina` |
| `furia_dura_cena_se_combinada` | combinada com Fúria do bárbaro, a Fúria dura uma cena | `furia-divina` |
| `passa_automaticamente_cavalgar_sem_queda` | sucesso automático em Cavalgar p/ não cair ao sofrer dano | `ginete` |
| `ignora_penalidade_atacar_montado` | anula penalidade p/ atacar à distância / lançar magia montado | `ginete` |
| `reducao_dano_fogo_10` | redução de 10 de dano de fogo | `habitante-do-deserto` |
| `cria_agua_por_pm` | gasta 1 PM p/ criar água potável | `habitante-do-deserto` |
| `dobra_alcance_iluminacao` | efeitos de luz do personagem têm alcance de iluminação dobrado | `inimigo-de-tenebra` |
| `estilo-desarmado` reusou `anula_penalidade_dano_nao_letal` (já existente) | | `estilo-desarmado` |

> Nota: `reducao_dano_frio_trevas_5` / `reducao_dano_fogo_10` são lembretes porque `reducao_dano` é
> genérico (sem subtipo por dano). Se ALVO `reducao_dano.<tipo>` ou CAMPO `dano.tipo` for aprovado, viram `bonus`.

### Lote 8 (Sonnet 6×5) — chaves novas
| `soma_inteligencia_limite_carga` | soma Int ao limite de carga | `inventario-organizado` |
| `itens_pequenos_ocupam_quarto_espaco` | itens de meio espaço passam a 1/4 | `inventario-organizado` |
| `dano_maximo_no_acerto_corpo_a_corpo` | 1×/rod, 3 PM: acerto causa dano máximo (sem rolar) | `kiai-divino` |
| `explode_ao_morrer_alvo_mordido` | criatura mordida que cai a 0 PV explode (4d4 +2d4/2 poderes) | `larva-explosiva` |
| `atravessa_espacos_estreitos_como_moeda` | passa por qualquer espaço de moeda (enquanto ativo) | `legiao-aberrante` |
| `bonus_testes_manobra_e_resistencia_direcionados` | +X vs manobras e efeitos direcionados (escala) | `legiao-aberrante` |
| `imune_efeitos_movimento` | imune a efeitos que forçam/impedem movimento (enquanto ativo) | `liberdade-divina` |
| `bonus_pericias_sem_aliado_proximo` | +1 em perícias sem aliado em alcance curto | `lobo-solitario` |
| `ignora_penalidade_cura_em_si_mesmo` | usar Cura em si não sofre penalidade | `lobo-solitario` |
| `aprimoramento_muda_execucao_para_acao_livre` | aprimoramento (+4 PM): execução vira ação livre | `magia-acelerada` |
| `limite_uma_magia_acao_livre_por_rodada` | só 1 magia como ação livre por rodada | `magia-acelerada` |
| `aprimoramento_aumenta_alcance_um_passo` | aprimoramento (+2 PM): alcance sobe um passo | `magia-ampliada` |
| `aprimoramento_dobra_area_efeito` | alternativa: dobra a área | `magia-ampliada` |
| `aprimoramento_lanca_sem_gestos_nem_palavras` | aprimoramento (+2 PM): lança só por concentração | `magia-discreta` |
| `ignora_teste_misticismo_armadura_arcana` | dispensa teste de Misticismo por armadura | `magia-discreta` |
| `percepcao_lancamento_exige_misticismo_cd20` | detectar o lançamento exige Misticismo CD 20 | `magia-discreta` |
| `aprende_magia_escuridao` | aprende/lança Escuridão | `manto-da-penumbra` |
| `bonus_testes_agarrar` | bônus escalável em testes de agarrar | `maos-membranosas` |
| `cura_por_teste_cura` | ação completa: Cura CD 15 cura 1d6 (+1d6/5) em aliado | `medicina` |
| `alcance_corpo_a_corpo_aumentado` | alcance natural de ataque +X m (escala) | `membros-estendidos` |
| `possui_armas_naturais_patas_insetoides` | duas patas insetoides como armas naturais (1d4) | `membros-extras` |
| `ataque_extra_patas_insetoides_ao_agredir` | 1×/rod, 2 PM: dois ataques extras com as patas | `membros-extras` |
| `empunha_arma_leve_nas_patas_com_estilo` | com Ambidestria/Duas Armas, empunha leve nas patas | `membros-extras` |
| `resiste_efeitos_mentais` | resistência a efeitos mentais +X (escala) | `mente-aberrante` |
| `fala_com_animais_aquaticos` | comunica-se com animais aquáticos | `mestre-dos-mares` |
| `aprende_acalmar_animal_so_aquaticos` | aprende Acalmar Animal só vs aquáticos | `mestre-dos-mares` |
| `visao_no_escuro` | enxerga no escuro | `olhos-vermelhos` |
| `aprende_magia_amedrontar` | aprende/lança Amedrontar | `olhar-amedrontador` |
| `aprende_magia_enfeiticar` | aprende/lança Enfeitiçar | `palavras-de-bondade` |
| `possui_parceiro` | possui um parceiro (entidade própria) | `parceiro` |
| `nao_cumulativo_bonus_atributo_ativado` | não acumula com outros bônus de atributo da mesma origem | `poder-oculto` |
| `bonus_atributo_aleatorio_por_dado` | ação de mov + 2 PM: 1d6 → +2 em For/Des/Con até a cena | `poder-oculto` |
| `rerola_pericia_int_sab_apos_pesquisa` | após 1h de pesquisa, rerola um teste Int/Sab | `pesquisa-abencoada` |
| `bonus_rerolar_por_acervo_biblioteca` | +2/+5 no rerolar conforme o acervo disponível | `pesquisa-abencoada` |
| `ataque_reacao_ao_entrar_alcance_arma_longa` | 1×/rod, 1 PM: ataque qdo inimigo entra no alcance | `piqueiro` |
| `dano_extra_dois_dados_se_oponente_investiu` | +2 dados de dano se o inimigo veio em investida | `piqueiro` |

## A consolidar pelo humano (não seguem `verbo_objeto`)
As duas últimas (`resistencia_*`, `bonus_pericias_*`) nasceram substantivo-primeiro. Mantidas
como propostas; renomear para `verbo_objeto` se você preferir um padrão único.

### Lote 9 (Sonnet 8 agentes) — chaves novas (fecha a pasta poderes/)
| `fabrica_pocoes_oficio_alquimista` | usa Ofício p/ fabricar poções de magias conhecidas | `preparar-pocao` |
| `passo_dano_mordida_se_ja_possui_mordida` | se já tem mordida, o dado dela sobe 2 passos | `presas-primordiais` |
| `assusta_criaturas_alcance_curto` | ação+PM p/ assustar criaturas em alcance curto (Intimidação) | `presenca-aterradora` |
| `proficiente:<categoria>` | FLAG de proficiência (padrão canônico, irmão de `treinado:<pericia>`) | `proficiencia` |
| `ataque_extra_ao_quebrar_arma` | ao zerar PV da arma, 1 PM p/ ataque extra no usuário | `quebrar-aprimorado` |
| `acao_movimento_extra_primeiro_turno` | ação de movimento extra no 1º turno do combate | `reflexos-de-combate` |
| `resistencia_magia_divina_5` | +5 vs magia divina (app não distingue divina/arcana → lembrete) | `rejeicao-divina` |
| `forca_repeticao_ataque_oponente` | 2 PM: força oponente a repetir ataque pelo pior resultado | `reparar-injustica` |
| `resistencia_veneno_5` | +5 vs veneno (veneno não está em `dano.tipo` → lembrete) | `sangue-ofidico` |
| `aumenta_cd_venenos_proprios` | CD dos próprios venenos +2 | `sangue-ofidico` |
| `saca_guarda_itens_acao_livre` | sacar/guardar item vira ação livre | `saque-rapido` |
| `recarga_disparo_categoria_menor` | recarga de disparo cai uma categoria de ação | `saque-rapido` |
| `ignora_desprevenido_sem_visao` | não fica desprevenido vs inimigos que não vê | `sentidos-agucados` |
| `rerola_chance_falha_camuflagem` | rerola o dado de chance de falha por camuflagem | `sentidos-agucados` |
| `invoca_kobolds_capangas` | ação completa + 2 PM: invoca 2d4+1 kobolds por uma cena | `servos-do-dragao` |
| `sopra_cone_dano_frio` | ação + 1 PM: cone 6m, 2d6 frio (Reflexos reduz) | `sopro-do-mar` |
| `aprende_magia_sopro_das_uivantes_divina` | acesso a Sopro das Uivantes (divina) | `sopro-do-mar` |
| `rerola_teste_com_risco_pm` | 1 PM p/ rerolar; se falhar de novo, perde 1d6 PM | `sorte-dos-loucos` |
| `rerola_teste_uma_vez` | 3 PM p/ rerolar um teste (1×/teste) | `sortudo` |
| `acao_extra_padrao_ou_movimento` | 1×/rod, 5 PM: ação padrão/movimento extra | `surto-heroico` |
| `aprende_magia_tipo_oposto_por_circulo` | 1 magia/círculo da lista oposta (arcana/divina) | `teurgista-mistico` |
| `bonus_pericias_e_defesa_com_torcida` | +2 perícias e Defesa com aliados torcendo (não conhecível → lembrete) | `torcida` |
| `katana_conta_como_simples` | trata katana como arma simples | `tradicao-de-lin-wu` |
| `aprende_lanca_sussurros_insanos` | aprende/lança Sussurros Insanos | `transmissao-da-loucura` |
| `ataque_extra_ao_reduzir_alvo_a_zero` | ao zerar um alvo, 1 PM: ataque extra noutro inimigo | `trespassar` |
| `invoca_goblinoides_capangas` | ação completa + 2 PM: 1d4+1 goblinoides por uma cena | `tropas-duyshidakk` |
| `ignora_risco_auto_envenenamento` | não se envenena ao manusear venenos | `veneficio` |
| `bonus_cd_venenos` | CD dos próprios venenos +2 | `veneficio` |
| `visao_atravessa_escuridao_magica` | enxerga mesmo em escuridão mágica | `visao-nas-trevas` |
| `efeito_permanente_compreensao` | sob efeito permanente de Compreensão (idiomas) | `voz-da-civilizacao` |
| `fala_com_animais` | comunica-se com animais (Voz Divina) | `voz-da-natureza` |
| `aprende_acalmar_animal_so_animais` | aprende Acalmar Animal só vs animais | `voz-da-natureza` |
| `conhece_idiomas_monstros_inteligentes` | conhece idiomas de monstros inteligentes | `voz-dos-monstros` |
| `comunica_com_monstros_nao_inteligentes` | comunica-se com monstros não inteligentes | `voz-dos-monstros` |
| `reanima_cadaver_como_parceiro` | ação completa + 3 PM: reanima cadáver como parceiro por 1 dia | `zumbificar` |
| `sacrifica_parceiro_para_metade_do_dano` | sacrifica o parceiro zumbi p/ sofrer metade do dano | `zumbificar` |

> **Padrão canônico novo:** `proficiente:<categoria>` (flag de proficiência) — irmão de `treinado:<pericia>`.
> Tanto perícia à escolha (`treinamento-em-pericia`) quanto proficiência à escolha (`proficiencia`) usam
> `PoderProgressivo.escolhas` + `concedeCapacidade`.

> Removidas (viraram `pos_dano_recebido`): `causa_dano_acido_ao_atacante_corpo_a_corpo` (`sangue-acido`)
> e `causa_dano_psiquico_a_quem_forca_vontade` (`mente-aberrante`) — reação a dano recebido → atacante.

### RAÇAS (Sonnet 4 agentes, 17 raças) — chaves novas
Sentidos/sangue: `visao_na_penumbra` (elfo,silfide) · `imune_dano_queda` (silfide) ·
`recuperacao_pv_pm_minima_nivel` (goblin) · `tamanho_pequeno` (goblin).
Regras/permissões: `armas_familia_anoa_sao_simples` (anão) · `ignora_penalidade_deslocamento_armadura_carga`
(anão/golem) · `usa_adestramento_como_diplomacia_com_animais` (dahllan) · `ignora_penalidade_pericia_sem_ferramenta`
+ `bonus_pericia_com_ferramenta` (goblin) · `tridente_conta_como_simples` (sereia) · `katana_conta_como_simples` (já existia).
Treino/escolha: `treinado_2_pericias_a_escolha`+`pode_trocar_pericia_por_poder_geral` (humano) ·
`treinado_1_pericia_a_escolha` (kliren) · `memoria_postuma_escolha` (osteon) · `sem_origem_recebe_poder_geral` (golem).
Magia racial (todas com `modifica_poder patchCusto -1` p/ reaprendida): `aprende_duas_magias_cancao_dos_mares` (sereia),
`aprende_magia_luz_divina`/`aprende_magia_escuridao_divina` (suraggel), `aprende_magia_circulo_1` (qareen, reusada).
Armas naturais (+ ataque extra, em _ACOES_EXTRA): `possui_arma_natural_chifres` (minotauro),
`possui_arma_natural_mordida_1d6` (trog), `envenena_arma_propria` (medusa).
Impõe a inimigo (lembrete): `olhar_atordoante_fortitude` (medusa), `expele_gas_fetido_enjoa_criaturas` (trog).
Vulnerabilidade por dado (sem alvo): `dano_extra_por_dado_de_impacto` (kliren), `vulnerabilidade_dano_frio_por_dado` (trog).
Outros: `rerola_teste_resistencia_por_pm` (hynne), `soma_inteligencia_a_teste_pericia_por_pm` (kliren),
`fica_abalado_adjacente_queda_3m` (minotauro), `magia_pedida_desconta_1pm` (qareen),
`sem_agua_por_1_dia_impede_recuperar_pm` (sereia), `descanso_requer_estrelas_ou_subterraneo` (osteon).

> 🔴 CONSOLIDAR — TIPO DE CRIATURA: os agentes criaram chaves soltas p/ o MESMO conceito —
> `tipo_construto` (golem), `tipo_monstro` (lefou/trog), `tipo_espirito` (silfide/suraggel),
> `tipo_criatura_monstro` (medusa), `tipo_criatura_morto_vivo` (osteon). **Proposta: chave canônica
> `tipo_criatura:<x>`** (irmã de `treinado:`/`proficiente:`). Decisão sua → eu renomeio todas.
> 🔴 CONSOLIDAR — IMUNIDADES de morto-vivo/construto: `imune_cansaco_*`, `nao_precisa_respirar_*`,
> `cura_*` aparecem quase iguais em golem e osteon. Provável pacote canônico "imunidades_construto/morto_vivo".
> 🟡 `magia_reaprendida_custa_menos_1pm` / `magia_*_desconta_1pm` repetida em várias raças — mesma ideia.
> 🟡 RD por tipo: `reducao_dano_elemental_10_escolha` (qareen) ficou lembrete por ser ESCOLHIDA; `osteon`
> (fixa) já virou `bonus reducao_dano + dano.tipo`. Lembretes de RD-por-tipo de lotes antigos (fulgor-solar,
> habitante-do-deserto) podem ser promovidos a `bonus`+`dano.tipo` numa passada futura.

> ✅ PILOTO ESCOLHAS/OPCOES (humano/Versátil + lefou/Deformidade): migraram de `capacidade lembrete`
> para `escolhas` (slots conversíveis). Chaves agora OBSOLETAS nesses 2: `treinado_2_pericias_a_escolha`,
> `pode_trocar_pericia_por_poder_geral` (humano); `bonus_2_em_2_pericias_a_escolha_conta_poder_tormenta`,
> `pode_trocar_bonus_pericia_por_poder_tormenta` (lefou). Outras raças com escolha (kliren, suraggel,
> osteon/Memória Póstuma) AINDA são lembrete — aguardam aprovação do molde antes de replicar.

> ✅ CONSOLIDAÇÃO APLICADA (raças): tipo de criatura agora é a chave canônica `tipo_criatura:<x>`
> (renomeadas as 5 soltas). Imunidades morto-vivo/construto extraídas p/ `CONJUNTOS_CAPACIDADE`
> (`imunidades:construto`/`imunidades:morto_vivo`) em `efeitos.ts` — golem/osteon referenciam o conjunto,
> não copiam o bloco. As chaves individuais de imunidade (imune_*, nao_precisa_*, cura_*) agora vivem
> SÓ dentro do conjunto nomeado, não soltas nos JSONs.

### GLOSSÁRIO — Origens (passe de vocabulário, pré-fan-out)
> Passe de vocabulário sobre os 35 `poderesUnicos` das origens, ANTES do enriquecimento de `efeitos[]`.
> Objetivo: travar nomes canônicos de `capacidade` para os agentes reusarem. Nenhum JSON foi editado.
> ♻️ = chave REUSADA de seção anterior · 🆕 = chave nova proposta · — = não usa capacidade (vira bonus/substituicao/escolha).
> A grande maioria dos poderes de origem é PERK NARRATIVO/SOCIAL (consegue hospedagem/transporte/informação,
> influência, contato) → sempre `capacidade lembrete`. Os poucos que aterrissam num stat da ficha viram `bonus`.

| origem | poder único | tratamento | chave canônica |
|--------|-------------|------------|----------------|
| acolito | Membro da Igreja | capacidade lembrete | 🆕 `consegue_hospedagem_informacao_em_local` (CHAVE COMPARTILHADA — ver nota) |
| amigo-dos-animais | Amigo Especial | bonus (`pericia:adestramento` +5) **+** capacidade lembrete (parceiro) | ♻️ `possui_parceiro` (do poder `parceiro`) — o +5 é `bonus`, não capacidade |
| amnesico | Lembranças Graduais | capacidade lembrete | 🆕 `teste_sabedoria_reconhece_passado_pre_amnesia` |
| aristocrata | Sangue Azul | capacidade lembrete | 🆕 `possui_influencia_politica` (CHAVE COMPARTILHADA "influência/status" — ver nota) |
| artesao | Frutos do Trabalho | capacidade lembrete | 🆕 `recebe_itens_fabricados_por_aventura` (valor escala por patamar → `expr`) |
| artista | Dom Artístico | bonus (`pericia:atuacao` +2) **+** capacidade lembrete (dobro de tibares) | 🆕 `dobra_ganho_em_apresentacoes` (o +2 é `bonus`) |
| assistente-de-laboratorio | Esse Cheiro... | bonus (`pericia:fortitude` +2) **+** capacidade lembrete (detecção) | 🆕 `detecta_itens_alquimicos_alcance_curto` (o +2 é `bonus`) |
| batedor | À Prova de Tudo | capacidade lembrete | ♻️ `ignora_terreno_dificil` (do `acrobatico`) — aqui clima ruim + terreno natural; ver nota |
| capanga | Confissão | capacidade lembrete | 🆕 `interroga_com_pericia_sem_custo_em_uma_hora` (CHAVE COMPARTILHADA — ver nota) |
| charlatao | Alpinista Social | substituicao (`pericia:diplomacia` → `pericia:enganacao`) | — (substituicao de perícia, não capacidade) |
| circense | Truque de Mágica | capacidade lembrete (acesso só c/ aprimoramento Truque, não-mágico) | ♻️ família `aprende_magia_<x>` → 🆕 `lanca_magias_como_truque_de_prestidigitacao` (caso especial: 3 magias + restrição) |
| criminoso | Punguista | capacidade lembrete | 🆕 `usa_pericia_para_sustento` (CHAVE COMPARTILHADA "sustento via perícia" — ver nota) |
| curandeiro | Médico de Campo | capacidade lembrete | 🆕 `soma_sabedoria_a_cura_mundana` (NÃO é `bonus_cura_magica`: alvo é cura mundana; irmã de `soma_carisma_a_cura_magica`) |
| eremita | Busca Interior | capacidade lembrete (ativável, 1 PM) | 🆕 `medita_por_pm_recebe_dica_do_mestre` |
| escravo | Desejo de Liberdade | capacidade lembrete | 🆕 `bonus_testes_agarrar_e_movimento` (condição não rastreável; reusa parcial de `bonus_testes_agarrar` do `maos-membranosas`, mas inclui efeitos de movimento) |
| estudioso | Palpite Fundamentado | substituicao (perícia Int/Sab → `pericia:conhecimento`, custa 2 PM) | — (substituicao parametrizada) |
| fazendeiro | Água no Feijão | capacidade lembrete | 🆕 `ignora_penalidade_fabricar_pratos` (CHAVE COMPARTILHADA culinária — ver nota; mesma família de taverneiro) |
| forasteiro | Cultura Exótica | capacidade lembrete (1 PM) | 🆕 `usa_pericia_treinada_sem_treino_por_pm` |
| gladiador | Pão e Circo | capacidade lembrete | ♻️ `anula_penalidade_dano_nao_letal` (do `ataque-piedoso`) — mesmo conceito exato |
| guarda | Detetive | substituicao (Percepção/Intuição → `pericia:investigacao`, 1 PM, dura a cena) | — (substituicao parametrizada) |
| herdeiro | Herança | capacidade lembrete | 🆕 `recebe_item_inicial_por_valor` (pode pegar 2× → dobra teto; valor é regra de criação) |
| heroi-campones | Coração Heroico | bonus (`pm.max` +3, +3 por patamar) | — (aterrissa em `pm.max`; usar `expr` por patamar) |
| marujo | Passagem de Navio | capacidade lembrete | 🆕 `consegue_transporte_para_grupo` (CHAVE COMPARTILHADA transporte — ver nota) |
| mateiro | Vendedor de Carcaças | capacidade lembrete (tempo reduzido + bônus de mesa) | 🆕 `extrai_recursos_criatura_mais_rapido_com_bonus` |
| membro-de-guilda | Rede de Contatos | capacidade lembrete | 🆕 `interroga_com_pericia_sem_custo_em_uma_hora` ♻️ (MESMA de capanga — só muda a perícia: Intimidação vs Diplomacia) |
| mercador | Negociação | capacidade lembrete | 🆕 `vende_itens_com_acrescimo_percentual` |
| minerador | Escavador | proficiência **+** bonus dano **+** capacidade lembrete | ♻️ `proficiente:<categoria>` (picaretas) · ♻️ `ignora_terreno_dificil` (em masmorra/subterrâneo) · o +1 dano é `bonus` |
| nomade | Mochileiro | bonus (`carga.limite` +5) | ♻️ conceito de `aumenta_limite_carga` (`costas-largas`) — mas aqui aterrissa em `carga.limite` → é `bonus`, não capacidade |
| pivete | Quebra-Galho | capacidade lembrete | 🆕 `compra_itens_mundanos_com_desconto` |
| refugiado | Estoico | capacidade lembrete | 🆕 `melhora_categoria_descanso` (CHAVE COMPARTILHADA descanso — ver nota; irmã de `descanso-natural`) |
| seguidor | Antigo Mestre | capacidade lembrete | ♻️ `possui_parceiro` (parceiro mestre, 1×/aventura, fora do limite) |
| selvagem | Vida Rústica | capacidade lembrete | ♻️ `dorme_ao_relento_conta_como_confortavel` (do `descanso-natural`) **+** 🆕 `imune_efeitos_prejudiciais_ingeriveis` **+** 🆕 `recuperacao_descanso_minima_nivel` |
| soldado | Influência Militar | capacidade lembrete | 🆕 `consegue_hospedagem_informacao_em_local` ♻️ (MESMA de acolito — em bases militares) |
| taverneiro | Gororoba | capacidade lembrete | 🆕 `ignora_penalidade_fabricar_pratos` ♻️ (MESMA de fazendeiro — prato especial adicional) |
| trabalhador | Esforçado | bonus (testes estendidos +2) | 🆕 `bonus_testes_estendidos` (não há alvo de "teste estendido" em ALVOS → fica capacidade lembrete; ver nota) |

#### Conceitos que aparecem em 3+ origens (candidatos a chave compartilhada)
- **"Consegue hospedagem/informação/abrigo num lugar" → `consegue_hospedagem_informacao_em_local`** (♻️ irmã do que já existe em `acolito`/`soldado`): **acolito** (templo da divindade), **soldado** (bases militares). 2 diretos, mas o conceito é o perk social-base — manter UMA chave parametrizada por local.
- **"Conseguir transporte/passagem para o grupo" → `consegue_transporte_para_grupo`**: **marujo** (navio). Mesma família do anterior; pode ser sub-caso.
- **"Influência/status social que abre portas" → `possui_influencia_politica`**: **aristocrata** (nobreza/guarda). Família dos perks sociais; **herdeiro** e **acolito** roçam o conceito.
- **"Interrogar com perícia sem custo em 1 hora" → `interroga_com_pericia_sem_custo_em_uma_hora`** (3+ se contar fontes): **capanga** (Intimidação), **membro-de-guilda** (Diplomacia). MESMA mecânica, só muda a perícia → UMA chave parametrizada por perícia.
- **"Usar perícia para sustento" → `usa_pericia_para_sustento`**: **criminoso** (Ladinagem). Conceito da regra de Ofício/sustento; chave única reusável.
- **"Ignorar penalidade de fabricar pratos" → `ignora_penalidade_fabricar_pratos`** (CHAVE COMPARTILHADA): **fazendeiro** (5 pessoas) e **taverneiro** (prato especial adicional). MESMA família culinária → UMA chave.
- **"Melhora a categoria de descanso / descanso em lugar ruim" → família `descanso` (`melhora_categoria_descanso`, `dorme_ao_relento_conta_como_confortavel`, `recuperacao_descanso_minima_nivel`)**: **refugiado**, **selvagem**, e já existia **descanso-natural** (poder). 3 fontes → consolidar a família de descanso numa nomenclatura única.
- **"Ignora terreno difícil/clima" → `ignora_terreno_dificil`** (♻️ já existente): **batedor** (clima + terreno natural), **minerador** (masmorra/subterrâneo), **acrobatico** (poder existente). 3 fontes — a chave já é canônica; os agentes só anexam a condição de local como qualificador, NÃO criam chave nova.

> ⚠️ NOTAS DE DRIFT (consolidar pelo humano):
> - Vários nomes acima nasceram substantivo-primeiro/descritivos (`possui_influencia_politica`, `imune_efeitos_prejudiciais_ingeriveis`, `bonus_testes_*`). Mantidos como proposta; renomear p/ `verbo_objeto` na consolidação.
> - **`bonus_testes_estendidos` (trabalhador) e `bonus_testes_agarrar_e_movimento` (escravo)**: querem ser `bonus`, mas NÃO há ALVO para "teste estendido" nem "manobra agarrar/efeito de movimento" em `namespace.ts`. Logo ficam `capacidade lembrete` até existir alvo. (Mesma situação dos `bonus_pericias_*` de lotes antigos.)
> - **`curandeiro`/Médico de Campo**: é cura MUNDANA (`bonus_cura_magica` cobre só mágica) → fica `capacidade lembrete` `soma_sabedoria_a_cura_mundana`, irmã de `soma_carisma_a_cura_magica`. Se um ALVO `bonus_cura_mundana`/`bonus_cura` for aprovado, vira `bonus`.
> - **`amigo-dos-animais`, `artista`, `assistente-de-laboratorio`, `minerador`** são HÍBRIDOS: parte `bonus` (perícia/dano que aterrissa em ALVO) + parte `capacidade lembrete` (parceiro/detecção/perk). Os agentes devem emitir DOIS efeitos, não forçar tudo numa chave.

### Origens — fan-out (consumiu o GLOSSÁRIO acima). Chaves NOVAS fora do glossário:
| `ignora_penalidade_sobrevivencia_clima_terreno` | anula penalidade de Sobrevivência por clima ruim/terreno natural | `batedor` |
| `parceiro_nao_conta_limite_aliados` | o parceiro concedido não ocupa slot no limite de aliados | `seguidor` |
| `usa_conhecimento_no_lugar_de_pericia_int_sab` | gasta 2 PM p/ substituir um teste de qualquer perícia Int/Sab por Conhecimento | `estudioso` |

> ✅ Passe de vocabulário VALIDADO: 35 origens enriquecidas reusando o glossário; só 3 chaves novas
> (vs ~60 de drift nas raças). 2 quarentenas resolvidas: estudioso (→ lembrete), heroi-campones (→ `bonus pm.max`
> com `expr: "3 * patamar"`; variável `patamar` proposta em `_CAMPOS_NOVOS.md`).

### GLOSSÁRIO — Classes (passe de vocabulário, pré-fan-out)
> Passe de vocabulário sobre as 14 classes (`mecanica.habilidades` = features automáticas + `mecanica.poderes` =
> poderes selecionáveis), ANTES do enriquecimento de `efeitos[]`. ~382 habilidades/poderes — a fonte mais pesada,
> logo a de maior risco de drift. Objetivo: travar nomes canônicos de `capacidade` e os PATTERNS estruturais
> (spellcasting, caminho, companheiro, ativação/postura, golpe pessoal). NENHUM JSON de classe foi editado.
> ♻️ = chave/conceito REUSADO · 🆕 = chave nova proposta · — = NÃO usa capacidade (vira bonus/substituicao/ativacao/PoderProgressivo).

> ⛔ **AVISO CRÍTICO — Golpe Pessoal (guerreiro):** o poder `Golpe Pessoal` JÁ possui um campo `efeitos` no JSON
> (uma lista-construtor de 17 opções narrativas: Amplo, Atordoante, Brutal, Conjurador, Elemental, etc., cada uma
> com `nome`/`custo`/`descricao`). Esse `efeitos` é um CONSTRUTOR DE OPÇÕES, NÃO o `efeitos[]` do contrato.
> **NÃO sobrescrever, NÃO converter, NÃO renomear.** É o ÚNICO caso assim nas classes. O agente do guerreiro
> deve deixar Golpe Pessoal intacto (no máximo tratar como quarentena/lembrete) e enriquecer os DEMAIS poderes.

#### (a) Chaves canônicas de `capacidade` propostas
| chave canônica | significado | novo/reusado | classes onde aparece |
|----------------|-------------|--------------|----------------------|
| `realiza_ataque_extra_ao_agredir` | 1×/rod, gasta PM p/ ataque adicional na ação agredir (corpo a corpo/arremesso/desarmado) | 🆕 (consolida família "ataque extra ao agredir": `ataque_extra_*_ao_agredir`, `realiza_ataque_extra_escudo` etc.) | barbaro (Frenesi), guerreiro (Ataque Extra), lutador (Golpe Relâmpago/Trocação), caçador (Bote/Chuva de Lâminas), bardo (Dança das Lâminas) |
| `ataque_duplo_duas_armas` | empunhando duas armas (uma leve), 2 ataques na ação agredir (−2 ataque) | ♻️ (já existe, de `estilo-de-duas-armas`) | caçador (Ambidestria), guerreiro (Ambidestria) |
| `ataque_de_oportunidade_condicional` | 1 PM p/ ataque qdo inimigo fica desprevenido / sai do alcance / aliado é atacado | 🆕 (família "ataque reativo"; cf. `ataque_reacao_ao_entrar_alcance_arma_longa`) | guerreiro (Ataque Reflexo), cavaleiro (Postura: Castigo de Ferro), ladino (Oportunismo) |
| `acao_extra_padrao_ou_movimento` | 1×/rod, gasta PM p/ ação padrão/movimento extra | ♻️ (de `surto-heroico`) | bucaneiro (Aventureiro Ávido), ladino (Velocidade Ladina/Emboscar), caçador (Emboscar), nobre (Inspirar Glória→aliado) |
| `acao_movimento_extra_primeiro_turno` | ação extra só na 1ª rodada do combate | ♻️ (de `reflexos-de-combate`) | bucaneiro (Presença Paralisante), caçador (Emboscar), ladino (Emboscar) |
| `reduz_dano_sofrido_por_pm` | gasta PM p/ reduzir à metade um dano sofrido (reação) | 🆕 | guerreiro (Durão), ladino (Rolamento Defensivo) |
| `passo_de_dado_desarmado` | dado de dano desarmado/natural sobe um passo (feature de progressão) | 🆕 (cf. `passo_dano_mordida_se_ja_possui_mordida`) | lutador (Briga/Dono da Rua), druida (Forma Selvagem) |
| `possui_parceiro` | possui um parceiro/companheiro (entidade própria) — companheiro animal, familiar, montaria, autômato, escudeiro | ♻️ (de `parceiro`/origens) | caçador, druida (Companheiro Animal), arcanista (Familiar), inventor (Autômato/Homúnculo), cavaleiro (Montaria/Escudeiro/Pajem), paladino (Montaria Sagrada) |
| `parceiro_nao_conta_limite_aliados` | o parceiro concedido não ocupa slot no limite de parceiros | ♻️ (de `seguidor`/`familiar-ofidico`) | cavaleiro (Escudeiro/Pajem), arcanista (Familiar via quadro) |
| `melhora_categoria_descanso` | sua condição de descanso sobe uma categoria | ♻️ (de `refugiado`, família descanso) | cavaleiro (Pajem) |
| `aprende_magia_<x>` | aprende/pode lançar uma magia nomeada (NÃO spellcasting de classe; é magia avulsa concedida por poder) | ♻️ (família existente) | barbaro (Totem Espiritual→magia por totem), bucaneiro (Flagelo dos Mares→Amedrontar), caçador (Elo com a Natureza→Caminhos da Natureza), ladino (Truque Mágico→arcana 1º círc.), paladino (Orar→divina 1º círc.) |
| `concede_bonus_pericias_aliados` | concede bônus em testes a ALIADOS próximos (motor não rastreia stats de terceiros → lembrete) | ♻️ (de `comandar`) | bardo (Inspiração), nobre (Gritar Ordens/Liderar pelo Exemplo), clérigo (Missas), cavaleiro (Baluarte→aliados) |
| `concede_pm_temporario_aliados` | concede PM temporários a aliados (início de cena ou direcionado) | 🆕 | cavaleiro (Estandarte), nobre (General), clérigo (Missa: Elevação) |
| `concede_acao_extra_aliado` | gasta PM p/ dar ação de movimento/padrão extra a um aliado | 🆕 | nobre (Estrategista/Inspirar Glória) |
| `permite_rerolar_teste_aliado` | gasta PM p/ um aliado rolar de novo um teste | 🆕 | nobre (Inspirar Confiança) |
| `ganha_pm_temporario_ao_acertar` | acerto crítico/ataque/ser-atacado gera PM temporário cumulativo (teto = nível) | 🆕 (consolida Panache, Foco de Batalha, Golpe Mágico, Confiança dos Ringues, Aspecto do Verão, Julgamentos Iluminação/Salvação) | bucaneiro (Panache), cavaleiro (Foco de Batalha), bardo (Golpe Mágico), lutador (Confiança dos Ringues), druida (Aspecto do Verão), paladino (Julg.: Iluminação) |
| `recupera_pm_ao_reduzir_inimigo` | recupera PM ao reduzir inimigo a 0 PV / acerto crítico | 🆕 | bucaneiro (Panache), caçador (Mestre Caçador), guerreiro (Campeão→devolve metade do custo) |
| `recupera_pv_ao_acertar` | acerto corpo a corpo recupera PV fixo | 🆕 | paladino (Julg.: Salvação) |
| `impoe_teste_resistencia_ou_perde_acao` | aura/presença força inimigo a Vontade ou perde a ação/fica fascinado (1×/cena/criatura) | ♻️ (de `aura_paz_inimigos_hostis`/`aparencia-inofensiva`) | nobre (Presença Aristocrática/Realeza), cavaleiro (Postura: Provocação Petulante), paladino (Julg.: Arrependimento) |
| `aura_condicao_em_inimigos` | aura ativável que impõe condição/dano a inimigos na área | ♻️ (família `aura_medo_inimigos`) | barbaro (Brado Assustador→vulnerável), paladino (Aura Ardente→dano luz) |
| `aura_buff_aliados` | aura/postura sustentada que concede bônus a você + aliados na área | 🆕 | paladino (Aura Sagrada + Auras Cura/Invencibilidade/Antimagia), cavaleiro (Baluarte/Égide) |
| `marca_alvo_para_bonus` | marca uma criatura → bônus de dano/perícia/ameaça contra ela até fim da cena | 🆕 (consolida Marca da Presa, Duelo, Julgamentos com "marcar inimigo") | caçador (Marca da Presa + Espreitar/Ponto Fraco/Inimigo), cavaleiro (Duelo), paladino (vários Julgamentos), ladino (Assassinar) |
| `imune_efeitos_medo` | imune a efeitos de medo | ♻️ (de `coragem-total`) | paladino (Julg.: Coragem) |
| `imune_encantamento` | imune a efeitos de encantamento | 🆕 (irmã de `imune_efeitos_medo`) | paladino (Virtude: Castidade) |
| `nunca_fica_surpreendido` | nunca é surpreendido / não fica desprevenido | ♻️ (cf. `ignora_desprevenido_sem_visao`, `sentidos-agucados`) | barbaro (Esquiva Sobrenatural), ladino (Esquiva Sobrenatural) |
| `nao_pode_ser_flanqueado` | não pode ser flanqueado | 🆕 | ladino (Olhos nas Costas) |
| `evasao_reflexos` | em efeito com Reflexos p/ metade do dano: passa = 0 dano (e variante aprimorada: falha = metade) | 🆕 | bucaneiro (Evasão/Evasão Aprimorada), ladino (Evasão/Evasão Aprimorada), cavaleiro (Postura: Muralha) |
| `rerola_teste_por_pm` | gasta PM p/ rolar de novo um teste recém-feito (com ou sem bônus) | ♻️ (de `sortudo`/`sorte-dos-loucos`) | bucaneiro (Sorte de Nimb), nobre (Jogo da Corte/Língua de Prata), bardo (Lendas e Histórias), clérigo via poderes, druida (Tranquilidade dos Lagos) |
| `refaz_teste_resistencia_contra_condicao` | gasta PM p/ refazer teste de resistência contra condição que o afeta (+bônus) | 🆕 | cavaleiro (Resoluto), druida (Tranquilidade dos Lagos) |
| `soma_atributo_em_pericia_por_pm` | gasta PM p/ somar um atributo (Car/Int/For) num teste de perícia | 🆕 (consolida Audácia, Engenhosidade, Orgulho, Força Indomável, Língua dos Becos) | bucaneiro (Audácia), inventor (Engenhosidade), nobre (Orgulho), barbaro (Força Indomável), lutador (Língua dos Becos) |
| `dobra_bonus_treinamento_pericia_por_pm` | gasta PM p/ dobrar bônus de treino numa perícia (Especialista) | 🆕 | ladino (Especialista), inventor (Maestria→escolhe 10) |
| `trata_pericia_como_treinada_por_pm` | gasta PM p/ contar como treinado numa perícia por um teste | 🆕 (cf. `usa_pericia_treinada_sem_treino_por_pm` de origem `forasteiro`) | bardo (Eclético) |
| `escolhe_10_em_pericia_por_pm` | gasta PM p/ optar pelo resultado 10 numa perícia | ♻️ (cf. `escolhe_10_em_cura`) | inventor (Maestria em Perícia) |
| `conjura_via_arte_em_combate` | substitui Luta por Atuação / lança magia + ataque ligado a Inspiração | 🆕 | bardo (Esgrima Mágica/Prestidigitação/Paródia) |
| `convoca_aliado_temporario` | conclama PNJ/parceiro temporário (1×/aventura ou por teste social) | ♻️ (família `consegue_*`/`possui_parceiro` de origens) | cavaleiro (Autoridade Feudal), nobre (Autoridade Feudal/Favor), bucaneiro (Amigos no Porto) |
| `fabrica_item_alquimico_oficio` | usa Ofício p/ fabricar poções/preparados/itens superiores/mágicos | ♻️ (família `fabrica_pocoes_oficio_alquimista`/`fabrica_pergaminhos`) | inventor (Alquimista Iniciado, Fabricar Item Superior/Mágico, Engenhoqueiro), arcanista (Caldeirão do Bruxo/Tinta), clérigo |
| `ativa_engenhoca_simula_magia` | ativa engenhoca (item mundano) que simula efeito de magia via Ofício | 🆕 (mecânica única do inventor; lembrete) | inventor (Engenhoqueiro + família) |
| `aumenta_cd_resistir_magia` | +X na CD p/ resistir às suas magias/habilidades (geral ou por escola) | 🆕 | arcanista (Fortalecimento/Especialista/Magia Pungente), bardo (Arte Mágica), druida (Força da Natureza), clérigo (Liturgia) |
| `reduz_custo_pm_magia` | reduz custo em PM das suas magias (geral / por escola / por linhagem) | 🆕 | arcanista (Alta Arcana/Mestre em Escola/Símbolo Sagrado), bardo (Artista Completo), druida (Aspecto da Primavera/Força da Natureza), clérigo (Símbolo Sagrado Energizado), paladino (Virtude: Caridade) |
| `cobre_arma_com_dano_elemental` | gasta PM p/ +Xd6 de dano elemental numa arma até fim da cena | 🆕 | druida (Aspecto do Verão), bardo (Golpe Elemental) |
| `reduz_dano_recebido_por_pm_em_solo` | gasta PM p/ reduzir dano enquanto em contato com solo/pedra | 🆕 | druida (Força dos Penhascos) |
| `expulsa_ou_comanda_mortos_vivos` | gasta ação+PM p/ expulsar/comandar mortos-vivos na área | 🆕 | clérigo (Expulsar/Comandar Mortos-Vivos) |
| `canaliza_energia_cura_ou_dano` | onda de energia positiva/negativa: cura vivos/fere mortos-vivos (ou inverso) por PM | 🆕 | clérigo (Canalizar Energia + Canalizar Amplo) |
| `viola_codigo_perde_pm` | violar código de conduta zera PM até o próximo dia (lembrete narrativo) | 🆕 (consolida Código de Honra/do Herói, Bravata, Virtudes) | cavaleiro (Código de Honra), paladino (Código do Herói/Virtudes), bucaneiro (Bravatas), barbaro (regra da Fúria) |
| `recebe_bonus_ao_cumprir_juramento` | cumprir uma bravata/juramento concede benefício até fim da aventura | 🆕 | bucaneiro (Bravata Audaz/Imprudente) |
| `escala_pm_por_poderes_da_familia` | bônus de PM progressivo conforme contagem de poderes do mesmo grupo (usar `contar({prerequisito/grupo})`) | — (é `bonus pm.max` com `expr`, NÃO capacidade) | paladino (Virtudes Paladinescas: +1/+3/+6/+10/+15) |
| `rouba_magia_de_conjurador` | ataque furtivo "rouba" magia vista / converte dano furtivo em PM | 🆕 | ladino (Ladrão Arcano/Roubo de Mana) |
| `aumenta_cd_venenos` | +X na CD dos próprios venenos | ♻️ (de `veneficio`/`sangue-ofidico`) | ladino (Veneno Potente), druida (Coração da Selva) |
| `veneno_dura_mais_ataques` | veneno aplicado dura por N ataques em vez de 1 | 🆕 | ladino (Veneno Persistente) |
| `desconto_compra_venda_itens` | compra com desconto / vende com acréscimo % (não cumulativo c/ barganha) | ♻️ (de `compra_itens_mundanos_com_desconto`/`vende_itens_com_acrescimo_percentual`) | inventor (Comerciante), ladino (Contatos no Submundo), arcanista/clérigo (autoridades) |
| `recebe_renda_por_aventura` | recebe T$/TO por aventura (título, riqueza, família) — regra de criação/mesa | ♻️ (cf. `recebe_item_inicial_por_valor` de `herdeiro`) | cavaleiro (Título), nobre (Riqueza/Título) |
| `recebe_item_inicial_por_valor` | começa com item(ns)/protótipo de valor X | ♻️ (de `herdeiro`) | inventor (Protótipo), nobre (Espólio) |
| `transforma_em_forma_selvagem` | gasta ação+PM p/ assumir forma de criatura (pacote de bônus por forma) | 🆕 (mecânica única do druida; ver PATTERN) | druida (Forma Selvagem + Aprimorada/Superior/Primal/Magia Natural) |
| `ignora_terreno_dificil` | terreno difícil não reduz deslocamento | ♻️ (de `acrobatico`) | caçador (Caminho do Explorador), druida (Caminho dos Ermos), ladino (Fuga Formidável), guerreiro (Bater e Correr) |
| `bonus_rastreamento_e_anti_rastreio` | +Sobrevivência p/ rastrear / +10 CD p/ ser rastreado | 🆕 | caçador (Rastreador/Caminho do Explorador), druida (Caminho dos Ermos) |
| `comunica_com_animais` | comunica-se com animais (usa Adestramento como Diplomacia) | ♻️ (de `voz-da-natureza`/`usa_adestramento_como_diplomacia_com_animais`) | caçador (Empatia Selvagem), druida (Empatia Selvagem) |
| `ignora_rd_por_pm` | gasta PM/poder p/ ignorar X pontos de RD do alvo | 🆕 | guerreiro (Romper Resistências/Golpe Demolidor), lutador (Punhos de Adamante), inventor (Encontrar Fraqueza) |
| `dano_extra_contra_alvo_vulneravel` | +ataque/+dano contra alvo caído/desprevenido/flanqueado/sob medo | 🆕 (consolida Valentão, Abusar dos Fracos) | guerreiro (Valentão), lutador (Valentão), bucaneiro (Abusar dos Fracos) |

#### (b) PATTERNS — como modelar (os agentes DEVEM seguir)
- **SPELLCASTING DE CLASSE (Magias / conjuração)** → NÃO é `aprende_magia_<x>`. A habilidade automática "Magias"
  (arcanista, clérigo, bardo, druida) é o motor de conjuração da classe: modele como **`capacidade` `lembrete`**
  (ex.: `lanca_magias_arcanas_da_classe` / `lanca_magias_divinas_da_classe`) + o dado estruturado já vive em
  `mecanica.conjuracao`. O app MOSTRA círculo/escola/atributo-chave; não recalcula. Reduções de custo / +CD de
  magia que aterrissam em número viram `bonus` (`reduz_custo_pm_magia`, `aumenta_cd_resistir_magia`) ou, quando
  não há ALVO (ex.: custo de magia não é um ALVO do namespace), ficam `lembrete`. `Magia Ilimitada` é o exemplo-ouro
  de bônus em `limite_pm_por_magia`. **Poderes que concedem UMA magia avulsa** (Truque Mágico, Orar, Totem Espiritual,
  Flagelo dos Mares) usam a família **`aprende_magia_<x>`** (lembrete), igual às raças.
- **CAMINHO / ESPECIALIZAÇÃO permanente** (Caminho do Arcanista: Bruxo/Mago/Feiticeiro; Linhagem do feiticeiro;
  Caminho do Cavaleiro: Bastião/Montaria; Bênção da Justiça: Égide/Montaria; Devoto Fiel→deus) → modele como
  **`PoderProgressivo` com `escolhas`/`OpcaoSlot`** (escolha única, salva na ficha como `EscolhaSalva`), NÃO como
  capacidade. As sub-opções que aterrissam em stat viram `efeitos` do degrau; as narrativas, `lembrete`. (Mesmo molde
  do piloto humano/Versátil e lefou/Deformidade. Aguarda aprovação do molde antes de replicar em massa — se em dúvida,
  deixe `lembrete` e marque `precisaRevisao`.)
- **COMPANHEIRO / PARCEIRO** (Companheiro Animal, Familiar, Montaria, Autômato, Homúnculo, Escudeiro, Pajem,
  Cavalo de Guerra) → **`capacidade` `possui_parceiro`** (lembrete) + se aplicável `parceiro_nao_conta_limite_aliados`.
  Os bônus que o parceiro concede a TERCEIROS/à ficha (ex.: Escudeiro: +1 dano/+1 Defesa) são `bonus` próprios.
  O tipo/nível do parceiro (iniciante→veterano→mestre) é dado de mesa, fica em `lembrete`.
- **ATIVAÇÃO (estado que dura rodadas/cena)** — Fúria (exemplo-ouro `FURIA`), Posturas de Combate (cavaleiro),
  Inspiração (bardo), Aura Sagrada (paladino), En Garde (bucaneiro), Bravura Final → use **`ativacao`** (custo como
  `expr` se escala; `encerramento` como aviso textual) + `condicao: { quando: "ativo" }` nos efeitos que só valem
  ligado. Posturas: "só uma por vez" e "manter exige X" vão em `ativacao.encerramento` (aviso), não em lógica.
- **MODIFICADOR OPCIONAL POR ATAQUE** — Ataque Especial (guerreiro), Golpe Divino (paladino), Duelo, Investida
  Destruidora, gastos de PM "ao acertar/ao atacar" → `bonus` com **`opcionalPorAtaque: true`** (NÃO toggle de ativacao),
  como o esclarecimento do lote 1. O custo em PM é metadado do ataque, não estado da bandeja.
- **FEATURES DE PROGRESSÃO NUMÉRICA** (Fúria +N, Instinto Selvagem, Esquiva Sagaz, Baluarte, Marca da Presa +XdY,
  Ataque Furtivo +XdY, Briga, Palavras Afiadas, Golpe Divino +XdY, Casca Grossa, Inspiração +N) → `bonus` com `valor`
  como **`{expr:...}`** escalando por `nivel`/`patamar`; quando sobe DADO, use `dados`/`passo_de_dado`. RD do bárbaro/
  cavaleiro/guerreiro/lutador → `bonus` em `reducao_dano`.
- **AURAS** — distinguir: aura que BUFA aliados na área (`aura_buff_aliados`, lembrete pois o motor não rastreia
  terceiros) vs aura que IMPÕE a inimigos (`aura_condicao_em_inimigos` / `impoe_teste_resistencia_ou_perde_acao`,
  lembrete). O bônus que cai em VOCÊ (ex.: Aura Sagrada soma seu Car nos seus testes de resistência) é `bonus` real.
- **GOLPE PESSOAL (guerreiro)** — ver AVISO CRÍTICO acima. Intacto.

> ⚠️ NOTA DE DRIFT (consolidar pelo humano): várias chaves acima nasceram em famílias amplas (`ganha_pm_temporario_ao_acertar`,
> `marca_alvo_para_bonus`, `realiza_ataque_extra_ao_agredir`, `soma_atributo_em_pericia_por_pm`) deliberadamente AGRUPANDO
> muitos poderes quase-idênticos das 14 classes — é o ponto do passe: dar UM nome ao conceito repetido em 3+ lugares antes
> do fan-out, em vez de 14 agentes cunharem 14 sinônimos. Os parâmetros (qual perícia/atributo/arma, qual condição, custo)
> entram em `valor`/`condicao`/`ativacao`, NÃO em chaves novas.

### GLOSSÁRIO — Itens não-mágicos (passe de vocabulário, pré-fan-out)
> Passe de vocabulário sobre `mecanica.especial` dos itens de `livro-basico/itens/`, ANTES do
> enriquecimento de `efeitos[]`. Objetivo: travar nomes canônicos de `capacidade` e os PATTERNS
> estruturais (consumível de dano, ferramenta-bônus, catalisador de magia, veneno, alimentação,
> munição, montaria/veículo, serviço) para os agentes reusarem. NENHUM JSON de item foi editado.
> 171 itens no total; **134 têm `mecanica.especial`** (os outros 37 são mundanos sem mecânica → não
> precisam de chave). Dos 134, a maioria CALCULA (cai num ALVO/dado): ~63 viram `bonus`/`dados`/
> `substituicao`/`modifica_poder`; ~71 são `capacidade lembrete` (regra que a ficha não policia).
> ♻️ = chave/conceito REUSADO de seção anterior · 🆕 = chave nova proposta · — = NÃO usa capacidade (vira bonus/dados/substituicao/modifica_poder).

#### (a) Chaves canônicas de `capacidade` propostas
| chave | significado | 🆕/♻️ | exemplos de itens |
|-------|-------------|-------|-------------------|
| `consumivel_causa_dano_em_alvo` | gasta ação p/ causar Xd de dano de tipo Y num alvo/área em alcance curto (teste de resistência reduz) — o DANO em si é `dados`, esta chave é o lembrete da ação/uso | 🆕 (PATTERN consumível-de-dano; o dado vira `dados`, não capacidade) | acido (2d4 ácido), agua-benta (2d10 luz só vs morto-vivo/demônio/diabo), fogo-alquimico (1d6 fogo+chamas), bomba (6d6 impacto área 3m), oleo (1d6 atraso se sofrer fogo) |
| `aplica_veneno` | inoculação (contato/ingestão/inalação) + CD Fortitude → condição na falha / efeito menor ao passar; perda de PV em dados é `dados`, a CONDIÇÃO é lembrete | 🆕 (PATTERN veneno; ver nota) | beladona, bruma-sonolenta, cicuta, essencia-de-sombra, nevoa-toxica, peconha-comum/concentrada/potente, po-de-lich, riso-de-nimb |
| `aumenta_cd_venenos_proprios` | a CD do próprio veneno aumenta em +X (parte do bloco de alguns venenos) | ♻️ (de `sangue-ofidico`/`veneficio`/`aumenta_cd_venenos`) | beladona (+5), po-de-lich (+5) |
| `recupera_pv_consumivel` | consumível que recupera Xd PV (cura MUNDANA, não mágica) — o valor é `dados`/`bonus` em `pv.atual`, esta chave marca o uso | 🆕 (cf. cura-mundana de origens; o número CALCULA) | balsamo-restaurador (2d4 PV), tocha/manopla? não — só consumíveis de cura |
| `recupera_pm_consumivel` | consumível que recupera Xd PM | 🆕 (irmão do anterior) | essencia-de-mana (1d4 PM) |
| `catalisador_modifica_magia` | item gasto como CATALISADOR que altera a próxima magia (mais dano, −custo, +CD, +dado por escola/tipo) — quando o efeito cai num número, prefira `modifica_poder`/`bonus`; senão lembrete | 🆕 (PATTERN catalisador; ver nota — muitos CALCULAM) | baga-de-fogo (+1d6 fogo), liquen-lilas (+1d6 frio), terra-de-cemiterio (+1d6 trevas), dente-de-dragao/essencia-abissal (sobe dado), musgo-purpura/ossos-de-monstro/saco-de-sal (+2 CD escola), po-de-cristal/po-de-giz/seixo-de-ambar (−1 PM escola), ramo-verdejante (+1 PV/dado cura) |
| `aumenta_limite_pm_por_magia` | +X no limite de PM gastável por magia (arcana) — É um ALVO (`limite_pm_por_magia`) → vira `bonus`, não capacidade | — (CALCULA: `bonus limite_pm_por_magia`; cf. exemplo-ouro Magia Ilimitada) | cajado-arcano (+1 e +1 CD), orbe-cristalino (+1) |
| `aumenta_cd_resistir_magias_proprias` | +X na CD p/ resistir às suas magias (geral / por escola / por tipo de conjurador) | ♻️ (de classes `aumenta_cd_resistir_magia`) | varinha-arcana (+1 arcana), tomo-hermetico (+2 1 escola), cajado-arcano (+1), flauta-mistica (+1 bardo), bolsa-de-po? não |
| `reduz_custo_pm_magia` | −X PM no custo de certas magias (escola / alcance pessoal / linhagem) | ♻️ (de classes) | medalhao-de-prata (−1 alcance pessoal), po-de-cristal/po-de-giz/seixo-de-ambar (−1 por escola — sobrepõe com catalisador) |
| `concede_pm_para_aprimoramentos` | ao lançar magia de certa escola, +X PM p/ gastar SÓ em aprimoramentos dela | 🆕 | bolsa-de-po (+2 PM em aprimoramentos de encantamento/ilusão) |
| `magias_causam_dano_extra_fixo` | suas magias causam +Xd de dano de tipo Y (item vestido/empunhado, não catalisador gasto) | 🆕 (cf. catalisador, mas PERMANENTE enquanto equipado → `modifica`/lembrete) | cetro-elemental (+1 dado do tipo da pedra), costela-de-lich (+1d6 trevas, mas bloqueia cura mágica) |
| `bloqueia_cura_magica` | enquanto empunha, você não recupera PV por efeitos mágicos de cura (custo do item) | 🆕 | costela-de-lich |
| `recupera_pm_chance_ao_conjurar` | ao gastar PM numa magia, % de chance (rola dado) de recuperar 1 PM | 🆕 | dedo-de-ente (1d4, resultado 4 → +1 PM) |
| `concede_luz` | acende e ilumina um raio de Xm por uma cena (item de luz mundano) | 🆕 (lembrete; raio/duração não são ALVO) | tocha (9m), lampiao (15m), (vela/lanterna se houver) |
| `usa_inspiracao_como_acao_movimento` | enquanto empunha, usa a habilidade Inspiração (bardo) como ação de movimento; conta como instrumento | 🆕 | alaude-elfico |
| `dobra_alcance_inspiracao_e_musica` | enquanto empunha, dobra o alcance de Inspiração e de Músicas de Bardo | ♻️ (cf. `dobra_alcance_iluminacao` de `inimigo-de-tenebra`) | tambor-das-profundezas |
| `conta_como_instrumento_musical` | o item conta como instrumento musical (gate p/ habilidades de bardo) | 🆕 (flag) | alaude-elfico, flauta-mistica, instrumento-musical, tambor-das-profundezas |
| `usavel_como_esoterico_por_bardo` | bardo pode usá-lo como item esotérico (lança magias com a mão que empunha) | 🆕 | instrumento-musical |
| `aumenta_capacidade_carga` | aumenta o limite de espaços de carga em +X — É um ALVO (`carga.limite`) → vira `bonus` | — (CALCULA: `bonus carga.limite`; cf. `aumenta_limite_carga`/`costas-largas`) | mochila-de-aventureiro (+2), alforje (+10 via montaria) |
| `nao_conta_como_item_vestido` | o item não ocupa o slot de "item vestido" | 🆕 (cf. `slot_item_vestido_extra` de `costas-largas`) | mochila |
| `saca_categoria_itens_como_acao_livre` | vestir o item permite sacar uma CATEGORIA de itens (poções/alquímicos/pergaminhos) como ação livre | 🆕 (consolida bandoleira+organizador; cf. `saca_arma_arremesso_acao_livre`) | bandoleira-de-pocoes (alquímicos+poções), organizador-de-pergaminhos (pergaminhos) |
| `penalidade_pericia_sem_ferramenta` | sem o item, −5 na perícia associada (a ferramenta NÃO dá bônus; ela REMOVE a penalidade de não tê-la) | ♻️ (cf. `ignora_penalidade_pericia_sem_ferramenta` de goblin, lado oposto) | gazua (Ladinagem/fechaduras), maleta-de-medicamentos (Cura), estojo-de-disfarces (Enganação/disfarce), instrumentos-de-oficio (Ofício), equipamento-de-viagem (Sobrevivência/acampar), sela (Cavalgar) |
| `concede_prato_especial` | comida que dá 1 bônus de alimentação/dia (PV/PM temp, +dado num teste, +recuperação no descanso); o valor CALCULA | 🆕 (PATTERN alimentação; o número vira `bonus`/`dados`) | batata-valkariana (+1d6 num teste), gorad-quente (+2 PM temp), macarrao-de-yuvalin (+5 PV temp), prato-do-aventureiro (+1/nível recup PV), sopa-de-peixe (+1/nível recup PM) |
| `possui_parceiro` | montaria/animal de companhia é um parceiro (entidade própria, dado de mesa) | ♻️ (de `parceiro`/origens/classes) | cavalo, cavalo-de-guerra, ponei, ponei-de-guerra, trobo, cao-de-caca |
| `dispensa_teste_cavalgar_em_combate` | a montaria dispensa o teste de Cavalgar (CD 20) p/ permanecer montado em combate | 🆕 | cavalo-de-guerra, ponei-de-guerra |
| `veiculo_stats` | veículo com bloco estruturado (tamanho/deslocamento/Defesa/PV/capacidade) — entidade própria, não stat do portador | 🆕 (lembrete; o bloco é dado de mesa) | balao-goblin, canoa, carroca, carruagem, veleiro |
| `servico_preco_por_tier` | serviço comprável com tabela de preço por tier (hospedagem, condução, magia, cura, mensageiro, estábulo) — regra econômica de mesa | 🆕 (lembrete; nenhum stat) | hospedagem, conducao, magia-servico, curandeiro, mensageiro, estabulo |
| `municao_consumida_por_arma` | pacote de munição usado por arma X; recarga = ação de tipo Y | 🆕 (lembrete; recarga é metadado da arma) | balas, flechas, pedras, virotes |
| `recarga_arma_acao` | recarregar a arma é uma ação de tipo Y (livre/movimento/padrão) | 🆕 (lembrete; pertence à arma, não dá stat) | besta-leve (mov), besta-pesada (padrão), mosquete/pistola (padrão), funda (mov), arco (livre) |
| `arma_usavel_montado` | a arma pode ser usada montado | 🆕 (flag de regra) | arco-curto |
| `usavel_como_arma_improvisada` | item utilitário pode ser empunhado como arma (estatísticas de arma X) | 🆕 (cf. tocha/pé-de-cabra/cajado/bordão) | pe-de-cabra (clava), cajado-arcano (bordão), tocha (simples leve 1d4+1 fogo) |
| `prende_ou_imobiliza_alvo` | item de captura: prende/enreda/algema o alvo (manobra + teste; condições de escape) | 🆕 (lembrete; mecânica de manobra, sem ALVO) | algemas, rede (também `nao_causa_dano`) |
| `requer_adaptacao_por_usuario` | precisa ser feito sob medida; trocar de usuário custa T$/trabalho de artesão | 🆕 (lembrete narrativo) | armadura-completa |
| `concede_invisibilidade_temporaria` | cobre alvo/objeto e o torna invisível por Xd rodadas (como Invisibilidade) | 🆕 (lembrete; duração oculta do usuário) | po-do-desaparecimento |
| `concede_paixao_temporaria` | faz o bebedor ficar enfeitiçado/apaixonado (Vontade CD Car anula), dura 1d3 dias | 🆕 (lembrete; condição imposta) | elixir-do-amor |
| `bonus_pericia_definido_na_compra` | +N numa perícia ESCOLHIDA entre um conjunto, fixada na compra/fabricação | 🆕 (o +N CALCULA via `bonus pericia:@escolha`; a escolha vira parâmetro) | colecao-de-livros (Conhecimento/Guerra/Misticismo/Nobreza/Religião), manto-camuflado (Furtividade só no terreno certo) |
| `bonus_interrogatorio_mas_penalidade_social` | +Investigação p/ interrogar / +CD Aparência Inofensiva, mas −Carisma vs quem liga p/ classe social | 🆕 (híbrido: parte bonus, parte lembrete) | andrajos-de-aldeao, farrapos-de-ermitao (variante) |
| `pm_extra_condicional_a_classe` | +X PM apenas se possuir certa habilidade de classe | 🆕 (CALCULA via `bonus pm.max` com condição de feature) | chapeu-arcano (+1 PM se Caminho do Arcanista) |

#### (b) PATTERNS — como modelar (os agentes DEVEM seguir)
- **CONSUMÍVEL DE DANO** (ácido, água benta, fogo alquímico, bomba, óleo) → o dano é `{ dados: {...} }`
  (NÃO `bonus`, pois não é stat do portador; é dano emitido contra um alvo). A ação/alcance/teste de
  resistência (Reflexos/Fortitude CD atributo) viram texto na capacidade `consumivel_causa_dano_em_alvo`
  (lembrete) — o app MOSTRA o dado e a CD, mas a rolagem de dano e o teste do alvo acontecem na mesa.
  **CALCULA o dado, lembrete o resto.** (Caso "só vs morto-vivo/demônio/diabo" da água benta → `condicao`
  por `alvo.tipo_de_criatura`.)
- **VENENO** (10 itens: peçonhas, cicuta, beladona, etc.) → bloco Inoculação/CD Fort/Falha/Passa. A perda de
  PV é `dados` (ex.: 1d12/rodada × 3 rodadas — registrar a duração no texto, NÃO inventar alvo de "dano por
  rodada"); a CONDIÇÃO imposta (paralisado, lento, inconsciente, debilitado) é `capacidade lembrete`
  (`aplica_veneno`) — não há ALVO de condição no namespace. CD de Fortitude/inoculação ficam no lembrete.
- **FERRAMENTA / VESTUÁRIO QUE DÁ +N EM PERÍCIA** (~25 itens: bandana +1 Intimidação, luneta +5 Percepção,
  capa-pesada +1 Fortitude, robe-místico +1 Misticismo, etc.) → **`bonus` em `pericia:<id>` (CALCULA)**, NÃO
  capacidade. Bônus situacional (luneta só "alcance longo", manto-camuflado só "no terreno certo") leva
  `condicao`. Quando a perícia é ESCOLHIDA na compra (coleção-de-livros) → parâmetro + `bonus pericia:@escolha`.
- **FERRAMENTA QUE REMOVE PENALIDADE** (gazua, maleta, instrumentos-de-ofício, sela…) → NÃO dá bônus; sua
  AUSÊNCIA impõe −5. Modele como `capacidade lembrete` `penalidade_pericia_sem_ferramenta` (o app avisa
  "sem este item, −5 em X"). É o lado-espelho de `ignora_penalidade_pericia_sem_ferramenta` (goblin).
- **CATALISADOR ALQUÍMICO / ESOTÉRICO QUE MODIFICA MAGIA** (catalisadores +1d6 por tipo, −1 PM por escola,
  +2 CD por escola; cajado/orbe/varinha/tomo) → quando o efeito cai num ALVO do namespace
  (`limite_pm_por_magia`) é `bonus`; quando altera a magia em si (custo/CD/dado por escola — sem ALVO) é
  `modifica_poder` OU `capacidade lembrete`. **Custo de magia, CD de magia e "dano da magia +1d6" NÃO são
  ALVOS** → na dúvida, lembrete. (Catalisadores são CONSUMIDOS por uso; esotéricos valem enquanto equipados.)
- **ALIMENTAÇÃO / PRATO ESPECIAL** (5 pratos) → o número CALCULA: PV/PM temporário (`bonus pv.temporario`/
  `pm.temporario`), +dado num teste (`dados`), +recuperação no descanso. A regra "1 bônus de alimentação por
  dia, dura 1 dia" é lembrete (`concede_prato_especial`). Ração comum/refeição comum = SEM mecânica.
- **MONTARIA / ANIMAL / VEÍCULO** → entidade própria. Montaria/animal = `possui_parceiro` (lembrete) +
  `dispensa_teste_cavalgar_em_combate` quando aplicável. Veículo (balão, canoa, carroça…) = `veiculo_stats`
  (lembrete; o bloco tamanho/PV/capacidade é dado de mesa, não stat do personagem).
- **MUNIÇÃO E RECARGA** → lembrete. Munição (`municao_consumida_por_arma`) e tempo de recarga
  (`recarga_arma_acao`) pertencem à ARMA, não concedem stat ao portador.
- **SERVIÇOS** (hospedagem, condução, magia-serviço, curandeiro, mensageiro, estábulo) → `servico_preco_por_tier`
  (lembrete). É regra econômica/de mesa; nenhum stat da ficha. A recuperação de PV/PM por tier de hospedagem
  é dado da regra de descanso, fica no lembrete.

#### (c) Provavelmente CALCULAM vs lembrete (sinalização p/ o fan-out)
- **CALCULAM (cai num ALVO/dado conhecido) — emitir `bonus`/`dados`/`substituicao`/`modifica_poder`:**
  - +N em perícia (todo o vestuário/ferramenta de bônus): `bonus pericia:<id>` — ~25 itens.
  - +N em resistência/atributo derivado: armadura-acolchoada (+2 Fortitude), casaco-longo (+5 Fort vs frio,
    −2 penalidade armadura), enfeite-de-elmo (resist. medo +2 → lembrete `resistencia_efeitos`/sem alvo),
    simbolo-sagrado (+1 resistência).
  - dano de consumível: ácido/água-benta/fogo/bomba/óleo → `dados`.
  - cura/PM de consumível: bálsamo (2d4 PV), essência-de-mana (1d4 PM) → `bonus`/`dados` em `pv.atual`/`pm.temporario`.
  - prato especial: PV/PM temp, +dado → `bonus`/`dados`.
  - carga: mochila-de-aventureiro (+2 `carga.limite`), alforje (+10) → `bonus carga.limite`.
  - limite de PM por magia: cajado-arcano/orbe-cristalino (+1) → `bonus limite_pm_por_magia` (exemplo-ouro Magia Ilimitada).
  - PM condicional: chapeu-arcano (+1 PM se Caminho do Arcanista) → `bonus pm.max` + condição.
  - propriedades de arma (Ágil/Adaptável/Versátil/Alcance/Dupla) → resolvidas pela biblioteca `PROPRIEDADES_ARMA`
    e pelo bloco `arma` estruturado, NÃO reescritas (adaga/katana/chicote/corrente/espada-bastarda/funda).
  - substituição: adaga/katana/chicote ("usar Destreza em vez de Força") → `substituicao` (= propriedade Ágil/Acuidade).
- **LEMBRETE (regra que a ficha não policia) — `capacidade lembrete`:**
  - venenos (condição imposta), luz (raio/duração), invisibilidade/paixão temporária, prender/enredar,
    montarias/veículos/animais, serviços, munição/recarga, catalisadores que mexem em custo/CD de magia,
    "−5 sem ferramenta", arma improvisada, requer adaptação, sacar categoria como ação livre, conta como
    instrumento musical, dispensa teste de Cavalgar.

> ⚠️ NOTAS DE DRIFT / decisões p/ o humano:
> - Vários nomes acima nasceram substantivo/descritivos ou fora de `verbo_objeto` (`veiculo_stats`,
>   `servico_preco_por_tier`, `municao_consumida_por_arma`, `pm_extra_condicional_a_classe`). Mantidos como
>   proposta; renomear na consolidação. Coerência com o drift já anotado nos lotes anteriores.
> - **Catalisador vs esotérico:** `catalisador_modifica_magia`, `reduz_custo_pm_magia` e o "−1 PM por escola"
>   dos pós (po-de-cristal/po-de-giz/seixo-de-ambar) SE SOBREPÕEM. Decisão: o agente emite UMA capacidade
>   (`catalisador_modifica_magia`) com o detalhe em `valor`/texto; só promove a `bonus`/`modifica_poder` o que
>   cair num ALVO real. Não cunhar chave por catalisador.
> - **Falta de ALVO recorrente:** "CD de magia", "custo de PM de magia" e "dano da magia +1d6" NÃO são ALVOS do
>   namespace → caem em lembrete. Se ALVOS `cd_magia`/`custo_magia` forem aprovados, ~14 catalisadores/esotéricos
>   migram p/ `bonus`. (Mesma situação de RD-por-tipo dos lotes de poderes.)
> - **`resistencia a medo +2` (enfeite-de-elmo) e `+1 resistência` (símbolo-sagrado):** "resistência a medo" não
>   tem ALVO; vira `capacidade lembrete` (irmã de `resistencia_efeitos_*`). O "+1 em testes de resistência" genérico
>   do símbolo sagrado idem (não há ALVO único "todas as resistências"; são 3 perícias Fort/Refl/Vont) → lembrete
>   ou 3 `bonus`. Decisão do humano.
> - **`bonus_interrogatorio_mas_penalidade_social` (andrajos/farrapos):** HÍBRIDO — o agente emite DOIS efeitos
>   (`bonus pericia:investigacao` + `bonus pericia:adestramento`/etc. e `bonus` NEGATIVO em perícias de Carisma com
>   condição), não força tudo numa chave.

#### (d) Conceitos em 3+ itens (candidatos a chave compartilhada — sinalizados)
- **+N em perícia (ferramenta/vestuário)** → `bonus pericia:<id>` — **~25 itens** (o maior grupo; NÃO é capacidade, é bonus).
- **−5 sem a ferramenta** → `penalidade_pericia_sem_ferramenta` — **6 itens** (gazua, maleta, estojo-de-disfarces, instrumentos-de-ofício, equipamento-de-viagem, sela).
- **Veneno (inoculação/CD/condição)** → `aplica_veneno` — **10 itens**.
- **Catalisador que modifica magia** → `catalisador_modifica_magia` (+ promoções p/ `bonus`/`modifica_poder`) — **~14 itens**.
- **Consumível de dano em alvo** → `consumivel_causa_dano_em_alvo` + `dados` — **5 itens** (ácido, água-benta, fogo-alquímico, bomba, óleo).
- **Prato especial / alimentação** → `concede_prato_especial` + `bonus`/`dados` — **5 itens**.
- **Montaria/animal parceiro** → `possui_parceiro` — **6 itens** (cavalo, cavalo-de-guerra, pônei, pônei-de-guerra, trobo, cão-de-caça).
- **Veículo com stats** → `veiculo_stats` — **5 itens** (balão-goblin, canoa, carroça, carruagem, veleiro).
- **Serviço por tier** → `servico_preco_por_tier` — **6 itens** (hospedagem, condução, magia-serviço, curandeiro, mensageiro, estábulo).
- **Munição / recarga** → `municao_consumida_por_arma` + `recarga_arma_acao` — **8+ itens** (balas, flechas, pedras, virotes, besta-leve/pesada, mosquete, pistola, funda, arco).
- **+CD p/ resistir às minhas magias** → `aumenta_cd_resistir_magias_proprias` — **4+ itens** (varinha-arcana, tomo-hermético, cajado-arcano, flauta-mística).
- **Conta como instrumento musical** → `conta_como_instrumento_musical` — **4 itens** (alaúde-élfico, flauta-mística, instrumento-musical, tambor-das-profundezas).

### Itens não-mágicos — fan-out (5 grupos + refação de 72). Chaves novas além do glossário (vivem nos JSONs):
`aplica_forca_ao_dano_disparo` (arco-longo,funda) · `usavel_como_marcial_duas_maos` (machado-anao) ·
`aumenta_bonus_magias_defensivas_proprias` (luva-de-ferro) · `bonus_testes_desarmar_arma_versatil` (mangual) ·
`dano_desarmado_vira_letal`+`conta_como_arma_para_encantos_desarmado` (manopla) · `aplica_condicao_em_chamas` (oleo) ·
`necessario_para_recuperacao_ao_relento` (saco-de-dormir) · `penalidade_armadura_2_enquanto_vestido` (casaco-longo) ·
`bonus_atletismo_descer_buraco_ou_muro` (corda) · `bonus_pericias_carisma_por_cena` (cosmetico) ·
`resistencia_efeitos_medo` (enfeite-de-elmo) · `magias_causam_dano_extra_fixo` (cetro,costela-de-lich) ·
`bloqueia_cura_magica` (costela-de-lich) · `pm_extra_condicional_a_classe` (chapeu-arcano) ·
`recupera_pm_chance_ao_conjurar` (dedo-de-ente) · `concede_paixao_temporaria` (elixir-do-amor) ·
`bonus_pericia_definido_na_compra` (colecao-de-livros) · `recupera_pm_no_descanso_por_nivel` (sopa-de-peixe).
> Vários "catalisador/CD/custo de magia" caíram em lembrete por falta de ALVO (ver decisões em `_CAMPOS_NOVOS.md`).

### GLOSSÁRIO — Itens mágicos (passe de vocabulário, pré-fan-out)
> Passe de vocabulário sobre os **186 itens mágicos** de `livro-basico/itens-magicos/`, ANTES do
> enriquecimento de `efeitos[]`. A prosa mecânica vive em `secoes[].texto` (concatenar); `mecanica` só
> tem `tipoItem`/`categoria`/`preco` (metadados). Objetivo: travar nomes canônicos de `capacidade` e os
> PATTERNS estruturais (encanto de arma/armadura, poção/óleo/granada, esotérico/catalisador, acessório de
> bônus contínuo vs ativável, item específico, artefato) para os agentes reusarem. NENHUM JSON foi editado.
> ♻️ = chave/conceito REUSADO de seção anterior · 🆕 = chave nova proposta · — = NÃO usa capacidade (vira bonus/dados/substituicao/modifica_poder/ativacao).
>
> **Distribuição por tipoItem:** Acessório 65 · Poção 32 (inclui óleos e granadas) · Encanto de Arma 28 ·
> Encanto de Armadura 25 · Arma Específica 18 · Armadura Específica 8 · Escudo Específico 5 · Artefato 5.
>
> **CALCULA vs lembrete vs ativável (estimativa do passe):** dos 186, ~**95 CALCULAM** (caem num ALVO/dado:
> +N atributo/perícia/Defesa/PV/PM/RD/resistência, +Xd6 dano de encanto, dano de consumível);
> ~**70 são lembrete** (poção/óleo/granada que replica magia → família `aprende_magia_<x>` + a magia carrega
> o efeito; auras/condições impostas; voo/luz/teletransporte; transformações); ~**55 têm ativação** (gasta PM,
> liga/desliga, sustentado) — overlap com as outras duas colunas (um item ativável pode CALCULAR quando ligado).
> O Encanto de Arma é o grupo de maior recorrência exata: o bloco "+1d6 dano de tipo Y / 1×rod, 2 PM: efeito".

#### (a) Chaves canônicas de `capacidade` propostas
| chave | significado | 🆕/♻️ | tipoItem / exemplos |
|-------|-------------|-------|---------------------|
| `aprende_magia_<x>` | item permite lançar uma magia nomeada (esotérico/poção/óleo/granada/acessório); muitos com "−1 PM se já conhece" via `modifica_poder patchCusto:-1` | ♻️ (família existente, raças/origens/classes) | Poção/óleo/granada (TODOS os 32 + as 3 granadas), gema-da-telepatia (Compreensão+Enfeitiçar), anel-de-telecinesia, elmo-do-teletransporte (Salto Dimensional+Teletransporte), maca-do-terror (Amedrontar), gema-elemental (Conjurar Elemental), bola-de-cristal (Vidência), garrafa-da-fumaca-eterna (Névoa), manto-da-aranha (Teia), fantasmagorico (Manto de Sombras) |
| `concede_efeito_magia_sem_custo` | item replica/concede uma magia SEM pagar PM (subfamília de `aprende_magia_<x>`: poção/óleo/esotérico que dispara o efeito de graça) | 🆕 (subcaso de `aprende_magia_<x>`; o efeito mecânico vem da MAGIA referenciada, não do item) | bainha-magica (Arma Mágica grátis), gema-elemental, flauta-fantasma (Esculpir Sons), oleo-de-* (cada óleo aplica sua magia ao objeto), pocao-de-* |
| `reduz_custo_pm_magia_conhecida` | se já conhece a magia, o custo dela cai −1 PM (acompanha quase todo acessório/esotérico de magia) | ♻️ (de `reduz_custo_pm_magia`, classes/itens) | anel-de-telecinesia, elmo-do-teletransporte, orbe-das-tempestades, maca-do-terror, manto-da-aranha, simbolo-abencoado (divinas do deus), cajado-do-poder, vingadora-sagrada (Golpe Divino) |
| `arma_dispara_magia_por_pm` | 1×/rod, gasta PM: em vez do ataque, dispara um efeito de dano em área/linha (o dado é `dados`, esta chave é o lembrete da ação) | 🆕 (PATTERN encanto-de-disparo; cf. `consumivel_causa_dano_em_alvo` dos itens não-mágicos) | flamejante (bola de fogo 6d6), eletrica (raio 3d8), azagaia-dos-relampagos (Relâmpago 8d6), besta-explosiva (Bola de Fogo), avalanche (tempestade de gelo), escudo-de-azgher/escudo-espinhoso/escudo-do-leao (disparo de dano) |
| `aplica_condicao_ao_acertar_por_pm` | 1×/rod, gasta 2 PM: ao acertar, impõe condição/dano-residual ao alvo (enredado, envenenado, dano na próxima rodada) — a CONDIÇÃO é lembrete | 🆕 (PATTERN encanto-de-condição; irmão de `aplica_veneno`) | congelante (enredado), corrosiva (4d4 ácido próx. rodada), venenosa (1d12/rod ×3), trovejante (atordoado no crítico), tumular (auto-dano por +dano) |
| `inflige_condicao_em_acerto_ou_critico` | acerto/crítico aplica condição progressiva sem custo (fraca→debilitada, sangrando, atordoado) — lembrete, condição não é ALVO | 🆕 (cf. anterior, mas sem gasto de PM; condições T20) | excruciante (fraca/debilitada), sanguinaria (sangrando cumulativo), trovejante, dilacerante/lancinante (+dano no crítico → na verdade `dados`/`bonus` no crítico) |
| `dano_extra_condicional_tipo_criatura` | +Xd de dano contra um TIPO de criatura (escolhido na fabricação ou por alinhamento divino) — o dado CALCULA via `dados` + `condicao` por `alvo.tipo_de_criatura` | — (CALCULA: `dados` + condicao; só a escolha do tipo é parâmetro/lembrete) | anticriatura (+4d8 vs tipo sorteado), sagrada (+2d8 vs malignos), profana (+2d8 vs bondosos) |
| `bonus_defesa_escudo_aumenta` | o bônus na Defesa concedido pelo ESCUDO/encanto de armadura aumenta em +X (é `bonus defesa` com condição de escudo/armadura equipada) | — (CALCULA: `bonus defesa`; cf. exemplo-ouro Pele de Ferro) | defensor (+2), guardiao (+4), defensora (encanto de arma, +2 Defesa) |
| `concede_reducao_dano_tipo` | concede redução de dano de um TIPO (ácido/fogo/frio/eletricidade/trevas) 10, ou RD genérica | — em parte (RD genérica = `bonus reducao_dano`; RD por TIPO = lembrete por falta de subtipo, ver nota) | invulneravel (RD 2/5 genérica → bonus), caustica/gelido/incandescente/relampejante/opaco/abencoado (RD por tipo → lembrete), avalanche (RD fogo 10), escudo-do-eclipse (RD trevas 10) |
| `emite_aura_condicao_inimigos_por_pm` | gasta ação+PM p/ aura que força inimigos em alcance curto a teste de resistência ou recebem condição (abalado/fascinado/cego/ofuscado) | ♻️ (de `aura_medo_inimigos`/`aura_condicao_em_inimigos`/classes) | assustador (abalado), hipnotico (fascinado), reluzente (cego), lamina-da-luz (ofuscado), lingua-do-deserto (desprevenido) |
| `impoe_teste_no_primeiro_atacante` | a 1ª criatura que te atacar na cena faz Vontade (CD Car) ou perde a ação; cancela se você atacar | ♻️ (de `impoe_teste_vontade_no_primeiro_atacante`/`aparencia-inofensiva`) | brincos-de-marah (idêntico ao poder Aparência Inofensiva, e acumula com ele) |
| `concede_voo_temporario_por_pm` | gasta PM p/ ganhar deslocamento de voo Xm sustentado (asas/flutuar) | 🆕 (o deslocamento_voo É um ALVO → quando ATIVO vira `bonus deslocamento_voo` c/ `condicao quando:ativo`; a ativação é `ativacao`) | alado (encanto, voo 12m), botas-aladas (voo 12m), tapete-voador, vassoura-voadora, manto-do-morcego (forma de morcego) |
| `escudo_flutuante_mantem_bonus_maos_livres` | gasta ação+PM p/ o escudo flutuar e manter o bônus na Defesa com as mãos livres | 🆕 | animado (encanto de escudo) |
| `arma_flutua_e_ataca_sozinha_por_pm` | gasta ação+PM p/ a arma flutuar e atacar sozinha em alcance curto (sustentado) | 🆕 | dancarina (encanto de arma) |
| `armazena_magia_descarrega_no_acerto` | um conjurador grava uma magia no item; ao acertar o ataque/ler, descarrega a magia sem pagar custo | 🆕 | conjuradora (encanto de arma), escudo-do-conjurador (lê como pergaminho) |
| `reflete_magia_ao_conjurador_por_pm` | 1×/rod, ao ser alvo de magia, gasta PM = custo dela p/ refleti-la ao conjurador | 🆕 | refletor (encanto), anel-refletor |
| `intercepta_ataque_em_aliado_por_pm` | 1×/rod, gasta 1 PM p/ tornar-se alvo de um ataque que atingiria aliado adjacente | 🆕 | zeloso (encanto), colar-guardiao-like |
| `ignora_dano_extra_critico_furtivo` | % de chance de ignorar o dano extra de crítico/ataque furtivo | ♻️ (de `ignora_dano_critico_furtivo`, exemplo-ouro) | fortificado (25%/50%) |
| `concede_habilidade_de_classe` | concede uma habilidade nomeada de classe (Ataque Extra, Briga, Trespassar...), restrita a esta arma/item; "se já possui, −1 PM" | 🆕 (consolida itens que dão feature de classe) | veloz (Ataque Extra), cinto-do-campeao (Briga), machado-silvestre (Trespassar), espada-sortuda (Sortudo via desconto) |
| `concede_cura_acelerada` | concede Cura Acelerada X (regeneração por rodada) — não há ALVO de regeneração → lembrete | 🆕 | anel-da-regeneracao (Cura Acelerada 5) |
| `cura_ao_cair_a_zero_pv` | 1×/dia, ao chegar a 0 PV, cura X PV automaticamente (antes de cair) | 🆕 | medalhao-de-lena (100 PV) |
| `dispensa_necessidades_corporais` | não precisa comer/beber/dormir (ou reduz o sono); imunidade a doenças/venenos | 🆕 (cf. `nao_precisa_respirar_comer_dormir` de construto/morto-vivo) | anel-do-sustento, pingente-da-saude (imune doenças/venenos) |
| `concede_imunidade_efeito` | imunidade a uma categoria de efeito (adivinhação, doenças, venenos, teias) | 🆕 (família `imune_<x>`) | anel-do-escudo-mental (adivinhação), manto-da-aranha (teias), pingente-da-saude |
| `permanece_sob_efeito_de_magia` | o usuário fica PERMANENTEMENTE sob efeito de uma magia (não gasta ação/PM) | 🆕 (subcaso de `aprende_magia` mas sem ativação — efeito contínuo) | anel-da-liberdade (Libertação permanente), anel-de-invisibilidade (Invisibilidade), lanterna-da-revelacao (revela invisíveis) |
| `transforma_arma_em_objeto_inofensivo` | gasta ação+PM p/ disfarçar a arma como objeto inócuo (indetectável por magia) | 🆕 | punhal-sszzaazita |
| `transforma_item_em_roupa_comum` | gasta ação+PM p/ a armadura/item parecer roupa comum mantendo propriedades | 🆕 | ilusorio (encanto de armadura) |
| `concede_parceiro_temporario` | item invoca/transforma-se num parceiro (entidade própria) por uma cena ou efeito | ♻️ (de `possui_parceiro`) | estatueta-animista (parceiro veterano por animal), espelho-da-oposicao (cópia hostil) |
| `aprisiona_criatura_em_reflexo` | criatura que vê o próprio reflexo faz Reflexos ou é presa num espaço extradimensional | 🆕 | espelho-do-aprisionamento |
| `veiculo_montaria_voador` | tapete/vassoura/montaria/corda com deslocamento de voo/movimento e capacidade de carga (entidade/equipamento de mesa) | ♻️ (cf. `veiculo_stats` dos itens não-mágicos) | tapete-voador, vassoura-voadora, corda-da-escalada (corda animada) |
| `bonus_escala_com_conjuracao` | bônus que ESCALA com o círculo/nível de conjuração do usuário (CALCULA via `expr`) | — (CALCULA: `bonus` com `expr` lendo `magia_circulo`/`nivel`; não é capacidade) | robe-do-arquimago (+Defesa = 5 + círculo máx; +resist = metade), cajado-da-destruicao (+1 dano/dado), cajado-da-vida (+2 cura/dado) |
| `bonus_condicional_a_traco_do_personagem` | bônus que só vale (ou aumenta) se o personagem tem código de conduta / é devoto de X / é treinado em Y / é da classe Z | — (CALCULA: `bonus` + `condicao`; o traço é flag manual, cf. `arma.preferida_divindade`) | espada-baronial (+1 por traço cumulativo), vingadora-sagrada (só paladino), armadura-da-luz (RD=Carisma se código/devoto), carapaca-demoniaca (só devoto neg.), couraca-do-comando/loriga-do-centuriao (poder Comandar) |

#### (b) PATTERNS — como modelar (os agentes DEVEM seguir)
- **ENCANTO DE ARMA — bônus permanente** (formidavel +2/+2, magnifica +4/+4, defensora +2 Defesa,
  faixas/braçadeiras +2 dano) → **`bonus` em ALVO real** (`ataque`, `dano`, `defesa`,
  `dano.distancia`/`dano.corpo_a_corpo`/desarmado), `aplicacao automatica` ou `contextual`. O "+1d6 de
  dano de fogo/frio/ácido/trevas" do encanto elemental → **`dados`** (dado de dano extra do mesmo
  ataque), NÃO `bonus`. Margem de ameaça (ameacadora "duplica") → `bonus critico.margem` com `operacao`
  apropriada / lembrete se "duplicar" não couber. Crítico +10 (dilacerante/lancinante) → `bonus dano`
  com `condicao` de crítico (campo de crítico não existe no namespace → provável lembrete; ver nota).
- **ENCANTO DE ARMA — gasto de PM ao atacar** (flamejante, eletrica, congelante, corrosiva, venenosa,
  tumular, assassina) → é o PATTERN "1×/rodada, 2 PM, ao acertar". O dado de dano disparado é `dados`;
  a CONDIÇÃO imposta (enredado/envenenado) é `capacidade lembrete` (`aplica_condicao_ao_acertar_por_pm`).
  Use `ativacao`/`opcionalPorAtaque` conforme o caso: como é OPÇÃO por ataque (não estado que dura
  rodadas), prefira **`opcionalPorAtaque: { custo: { pm: 2 } }`** no efeito de `dados`, igual ao
  esclarecimento do lote 1 (Golpe Poderoso). O texto descritivo ("emana chamas como tocha") é lembrete.
- **ENCANTO DE ARMADURA/ESCUDO** → três sabores: (1) **bônus contínuo** (abascanto resist.magia +5,
  protetor +2 resist, acrobatico +5 Acrobacia, escorregadio +10 escapar, sombrio +5 Furtividade) →
  `bonus` em ALVO (perícia/resistência) ou lembrete quando não há ALVO ("resistência a magia" SIM tem
  ALVO `resistencia_magia`; "resistência a efeitos" genérica NÃO → lembrete); (2) **+Defesa do item**
  (defensor +2, guardiao +4) → `bonus defesa` com condição de armadura/escudo equipado; (3) **ativável**
  (gasta ação+PM: caustica/gelido/incandescente/relampejante geram dano/PV temp; assustador/hipnotico/
  reluzente impõem condição em inimigos) → `ativacao` + a `capacidade` da aura. RD por tipo (caustica
  ácido 10, opaco 4 tipos) → ver nota de falta-de-ALVO.
- **POÇÃO / ÓLEO / GRANADA (replica magia)** → TODOS seguem o mesmo molde: "contém o efeito da magia X".
  Modele como **`capacidade lembrete` `aprende_magia_<x>`/`concede_efeito_magia_sem_custo`** + o efeito
  mecânico VEM DA MAGIA referenciada (que já está/estará enriquecida em `magias/`), NÃO reescreva o efeito
  da magia no item. Variações de potência ("2d8+2 / 4d8+4 / ...", "6d6 / 10d6") e aprimoramentos são
  metadados de preço/tier → lembrete, NÃO inventar dado. Granada = mesma coisa, ação padrão p/ arremessar.
  Óleo = aplica a magia a um objeto. **NÃO duplicar o dado da magia no JSON do item.**
- **ESOTÉRICO / CATALISADOR DE MAGIA** (cajado-da-destruicao, cajado-da-vida, cajado-do-poder, robe-do-
  arquimago, orbe-das-tempestades, simbolo-abencoado) → o que cai num ALVO do namespace é `bonus`
  (`limite_pm_por_magia`, `custo_magia` negativo condicionado a `magia.escola`/`magia.circulo`, `defesa`/
  `resistencia_magia` que escalam com conjuração via `expr` lendo `magia_circulo`/`nivel`). O que NÃO tem
  ALVO ("+1 dano por dado da magia", "+2 cura por dado", "+2 CD para resistir") fica `capacidade lembrete`
  (mesma lacuna de ALVO `cd_magia`/"dano da magia +X" anotada nos itens não-mágicos). "Conta como cajado
  arcano" → reaproveitar a base, não recopiar.
- **ACESSÓRIO — bônus contínuo** (anéis/amuletos/cintos/brincos/tomos de +N atributo, +PV, +PM, +Defesa,
  +perícia, +deslocamento) → **`bonus` em ALVO** (`atr.*`, `pv.max`, `pm.max`, `defesa`, `pericia:<id>`,
  `deslocamento`), `aplicacao automatica`. O "somente após um dia/semana de uso" é flag narrativo
  (lembrete textual, não muda o cálculo). Manuais/tomos de +1 atributo = `bonus atr.*`.
- **ACESSÓRIO — ativável** (gasta PM, sustentado: alado/botas-aladas voo; assustador aura; espadas que
  acendem luz) → `ativacao` (custo PM, ação) + os efeitos com `condicao: { quando: "ativo" }`. Voo/luz/
  teletransporte SEM ALVO ficam lembrete; voo COM ALVO (`deslocamento_voo`) vira `bonus` enquanto ativo.
- **ARMA / ARMADURA / ESCUDO ESPECÍFICO** → quase sempre é "uma arma-base + um ou mais ENCANTOS nomeados
  embutidos na prosa" (ex.: avalanche = "machado de guerra congelante formidavel"; armadura-da-luz =
  "completa guardiã zelosa"). O agente NÃO reescreve os encantos: reaproveita os efeitos dos encantos já
  enriquecidos (formidavel→`bonus +2/+2`, defensor→`bonus +2 Defesa`, etc.) e enriquece SÓ o efeito
  ADICIONAL específico do item (a habilidade ativável própria, o bônus condicional a traço). Bônus
  condicional a classe/devoção/treino → `bonus` + `condicao` (flag manual, cf. `arma.preferida_divindade`).
- **ARTEFATO** (a-espada-deus, a-joia-da-alma, o-baralho-do-caos, o-olho-de-sszzaas, os-rubis-da-virtude)
  → COMPLEXOS, múltiplas seções narrativas + efeitos heterogêneos (concede magias, bônus permanentes,
  tabelas aleatórias, ganchos de campanha). A maioria das seções é NARRATIVA pura (lembrete) ou regra de
  mesa que o app não policia. Enriquecer SÓ os bits que aterrissam em ALVO (ex.: cartas do Baralho do
  Caos: "+5 PM permanente", "+10 PV permanente", "+1 atributo" → `bonus` com `duracao: "permanente"`;
  "resistência 10 a um tipo" → lembrete). **Na dúvida num artefato, `precisaRevisao: true` + quarentena.**

#### (c) Provavelmente CALCULAM vs lembrete (sinalização p/ o fan-out)
- **CALCULAM (cai num ALVO/dado) — `bonus`/`dados`/`substituicao`/`modifica_poder`:**
  - +N atributo (amuleto-robustez +2 Con, cinto-forca-gigante +2 For, tiara/brincos +Int, coroa +2 Car,
    luvas-delicadeza +1 Des, manoplas-ogro +1 For, estola +2 Sab, manuais/tomos +1 atributo) → `bonus atr.*`.
  - +PV/+PM (anel-vitalidade +10 PV, anel-energia +5 PM) → `bonus pv.max`/`pm.max`.
  - +Defesa (anel-protecao +2, colar-guardiao +5, braceletes-bronze +4/ouro +8) → `bonus defesa`.
  - +perícia (acrobatico +5, sombrio +5, manto-elfico/manto-morcego +5 Furtividade) → `bonus pericia:<id>`.
  - +resistência a magia (abascanto +5, vingadora-sagrada +5) → `bonus resistencia_magia`.
  - +deslocamento (botas-velozes +3m, ferraduras +3m) → `bonus deslocamento`; voo enquanto ativo → `bonus deslocamento_voo`.
  - +dano à distância/desarmado (braçadeiras-arqueiro +2, faixas-pugilista +2) → `bonus dano.distancia`/`dano`.
  - bônus de encanto de arma (formidavel/magnifica +ataque/+dano; +1dX dano elemental) → `bonus`/`dados`.
  - +Defesa do escudo/armadura (defensor +2, guardiao +4) → `bonus defesa` c/ condição de equipado.
  - escala com conjuração (robe-do-arquimago, cajados) → `bonus` com `expr`.
  - dano de consumível/disparo de encanto (flamejante 6d6, azagaia 8d6, escudos de disparo) → `dados`.
  - cura de poção (curar-ferimentos) → vem da MAGIA; PV temp (vitalidade-fantasma) idem.
  - RD genérica (invulneravel 2/5) → `bonus reducao_dano`.
  - bônus condicional a traço/classe/devoção (espada-baronial, vingadora-sagrada, couraca-do-comando) → `bonus`+`condicao`.
  - substituição (cota-elfica "aplica Destreza na Defesa como leve") → `substituicao`/regra de armadura.
- **LEMBRETE (regra que a ficha não policia) — `capacidade lembrete`:**
  - poção/óleo/granada que replica magia (família `aprende_magia_<x>`; o número vem da magia, não do item) — ~35 itens.
  - RD por TIPO (caustica/gelido/incandescente/relampejante/opaco/abencoado, escudo-do-eclipse, avalanche)
    — falta subtipo de `reducao_dano`; ver nota (mesma situação dos lotes de poderes).
  - auras/condições impostas a inimigos (assustador, hipnotico, reluzente, lamina-da-luz, brincos-de-marah).
  - condição imposta ao acertar (congelante enredado, venenosa, excruciante, trovejante, sanguinaria).
  - voo/luz/teletransporte/invisibilidade/transformação SEM ALVO; permanece sob efeito de magia.
  - cura acelerada/regeneração, cura-ao-zerar (anel-regeneracao, medalhao-de-lena).
  - dispensa comer/dormir, imunidades (anel-sustento, pingente-saude, anel-escudo-mental, manto-aranha).
  - parceiros/cópias/veículos voadores (estatueta-animista, espelho-da-oposicao, tapete/vassoura).
  - "−1 PM se já conhece a magia" (via `modifica_poder patchCusto`), "+X CD/+X dano por dado da magia"
    (catalisador sem ALVO), "conta como dois encantos", "somente após um dia de uso".
  - artefatos: quase tudo narrativo/ganchos de campanha; só os `bonus` permanentes calculam.

#### (d) Conceitos em 3+ itens (candidatos a chave compartilhada — sinalizados)
- **+N em um ATRIBUTO** → `bonus atr.*` — **~13 itens** (robustez, força-gigante, brincos-sagacidade, coroa,
  luvas, manoplas, estola, manto-fascinio, torque, tiara, pulseiras, pingente-sensatez, 3 manuais/tomos). NÃO é capacidade.
- **Replica/concede efeito de MAGIA** → `aprende_magia_<x>` / `concede_efeito_magia_sem_custo` — **~45 itens**
  (32 poções/óleos + 3 granadas + ~10 acessórios/esotéricos de magia). O MAIOR grupo lembrete.
- **+1dX de dano elemental no ataque (encanto)** → `dados` (não capacidade) — **6 encantos** (flamejante, congelante, corrosiva, eletrica, tumular, escudo-do-eclipse).
- **1×rod, 2 PM ao acertar → dano em área/condição** → `arma_dispara_magia_por_pm` / `aplica_condicao_ao_acertar_por_pm` — **8+ encantos/itens** (flamejante, eletrica, congelante, corrosiva, venenosa, tumular, anticriatura).
- **+2/+4 em ataque e dano (formidável/magnífica e derivados)** → `bonus ataque`+`bonus dano` — **~5 encantos** (formidavel, magnifica, energetica) + embutido em ~15 armas/armaduras específicas.
- **+Defesa do item (encanto de armadura/escudo)** → `bonus defesa` — **defensor, guardiao, defensora** + embutido em ~13 específicos ("defensor(a)/guardiã").
- **RD por TIPO 10** → lembrete por falta de subtipo — **~8 itens** (caustica, gelido, incandescente, relampejante, opaco, abencoado, escudo-do-eclipse, avalanche).
- **Aura ativável que impõe condição a inimigos** → `emite_aura_condicao_inimigos_por_pm` — **~6 itens** (assustador, hipnotico, reluzente, lamina-da-luz, escudo-de-azgher, lingua-do-deserto).
- **−1 PM se já conhece a magia** → `modifica_poder patchCusto:-1` — **~7 itens** (anel-telecinesia, elmo-teletransporte, orbe-tempestades, maca-terror, manto-aranha, simbolo-abencoado, cajado-do-poder).
- **Voo temporário por PM** → `concede_voo_temporario_por_pm` / `bonus deslocamento_voo` — **5 itens** (alado, botas-aladas, tapete, vassoura, manto-morcego).
- **Bônus condicional a traço/classe/devoção do personagem** → `bonus`+`condicao` — **~7 itens** (espada-baronial, vingadora-sagrada, armadura-da-luz, carapaca-demoniaca, couraca-do-comando, loriga-do-centuriao, simbolo-abencoado).
- **Concede habilidade nomeada de classe (restrita ao item)** → `concede_habilidade_de_classe` — **4 itens** (veloz/Ataque Extra, cinto-campeao/Briga, machado-silvestre/Trespassar, espada-sortuda/Sortudo).
- **Refletir magia ao conjurador / armazenar magia no item** → `reflete_magia_ao_conjurador_por_pm` (2: refletor, anel-refletor) + `armazena_magia_descarrega_no_acerto` (2: conjuradora, escudo-do-conjurador).

#### (e) Candidatos a ALVO NOVO que faltam (NÃO inventar — listar p/ decisão do humano)
> Repetem-se em vários itens mágicos e hoje caem em lembrete só por falta de ALVO/CAMPO no namespace.
> Mesmas lacunas já anotadas nos lotes de poderes/itens não-mágicos — reforçadas aqui pela recorrência.
- **`reducao_dano.<tipo>`** (ou CAMPO já existe `dano.tipo`, falta o ALVO subtipado): RD por tipo aparece
  em ~8 encantos de armadura + escudos + armas. Se aprovado, ~8 itens migram de lembrete p/ `bonus`.
- **`cd_magia`** (CD para resistir às minhas magias): cajado-do-poder (+2/+3), orbe, esotéricos. Hoje lembrete.
- **`dano_magia_por_dado` / `cura_magia_por_dado`**: cajado-da-destruicao (+1 dano/dado), cajado-da-vida
  (+2 cura/dado). Não há ALVO p/ "modificar o dado da magia" → lembrete. (≠ `bonus_cura_magica` que é flat.)
- **`resistencia_efeitos` genérico** ou subtipos (medo, necromancia, veneno): abencoado (+5 vs necromancia),
  manto-aranha (+5 vs veneno), protetor (+2 resist genérico). "+2 em testes de resistência" = 3 perícias
  (Fort/Refl/Vont) → 3 `bonus pericia:` OU 1 lembrete; decisão do humano (mesma questão do símbolo-sagrado).
- **CAMPO `acao` valor `critico` / `ataque_critico`** (efeito que só vale num acerto crítico): dilacerante,
  lancinante, drenante, trovejante, florete-fugaz. Hoje sem campo p/ "no crítico" → lembrete/aproximação.
- **`regeneracao` / `cura_acelerada`**: anel-da-regeneracao (Cura Acelerada 5). Sem ALVO → lembrete.
- **`margem_critico` operação "multiplicar"/"duplicar"**: ameacadora ("duplica a margem"). `critico.margem`
  existe como ALVO, mas "duplicar antes de somar" precisa de ordem de operação — confirmar com o humano.

> ⚠️ NOTAS DE DRIFT / decisões p/ o humano (coerentes com lotes anteriores):
> - Vários nomes acima nasceram substantivo/descritivos ou fora de `verbo_objeto` (`veiculo_montaria_voador`,
>   `dispensa_necessidades_corporais`, `permanece_sob_efeito_de_magia`). Mantidos como proposta; renomear na consolidação.
> - **`aprende_magia_<x>` vs `concede_efeito_magia_sem_custo`:** são a MESMA família. Para poções/óleos/granadas
>   (consumível que dispara a magia uma vez) o conceito é "concede o efeito sem custo"; para acessórios que
>   "podem lançar a magia" repetidamente é "aprende_magia". O agente emite UMA capacidade da família + o efeito
>   real vem da MAGIA referenciada — NÃO recopiar o dado/efeito da magia no item.
> - **Encantos embutidos em itens específicos:** ~30 dos 31 itens específicos (arma/armadura/escudo) citam
>   encantos nomeados na prosa (formidavel, defensor, guardiao, zeloso, congelante...). O agente REAPROVEITA os
>   efeitos do encanto já enriquecido; só enriquece o efeito ADICIONAL próprio do item. Evita 30 cópias do mesmo bônus.
> - **Crítico sem CAMPO:** muitos encantos disparam "no acerto crítico" mas não há CAMPO_CONDICAO p/ crítico.
>   Por ora: `bonus dano` (o +10 de dilacerante CALCULA) com nota textual de "no crítico", ou lembrete. Decisão do humano.

### Lote itens mágicos fan-out (Sonnet — 31 itens) — chaves novas fora do glossário
| chave | significado | de onde veio |
|-------|-------------|--------------|
| `todo_dano_causado_e_nao_letal` | todo o dano causado pela arma é tratado como não letal (pode desativar gastando 1 PM) | `piedosa` |
| `bonus_jogatina_vira_penalidade_ao_abusar` | o +10 em Jogatina torna-se −10 se o mestre considerar que o portador "abusou da sorte" (regra de mesa, não policiável) | `o-baralho-do-caos` |
| `ativa_baralho_do_caos_ao_dizer_aposto_tudo` | ao declarar "Eu aposto tudo" e sacar 1–4 cartas, o baralho revela 22 cartas com efeitos aleatórios instantâneos | `o-baralho-do-caos` |
| `lanca_qualquer_magia_conhecida_sem_pm` | permite lançar qualquer magia conhecida ou ouvida (arcana ou divina) sem gastar PM; aprimoramentos ainda custam PM; exige teste de Misticismo CD 20 + custo da magia | `o-olho-de-sszzaas` |
| `aprimoramentos_de_magia_custam_pm_normalmente` | ao usar o Olho, aprimoramentos ainda têm custo normal de PM | `o-olho-de-sszzaas` |
| `falha_em_misticismo_cd_causa_efeito_imprevisivel_ou_controle_sszzaas` | falha no teste de Misticismo causa efeito imprevisível ou é na verdade Sszzaas manipulando o resultado (narrativo, regra de mestre) | `o-olho-de-sszzaas` |
| `concede_nivel_em_classe_existente_ao_incrustar` | ao incrustar o Rubi no corpo (Cura CD 25, 1 dia de efeito), o portador ganha um nível em uma classe que já possui | `os-rubis-da-virtude` |
| `bonus_resistencias_cumulativo_por_rubi` | cada Rubi equipado adiciona +1 em todos os testes de resistência (cumulativo com outros rubis e outros efeitos) | `os-rubis-da-virtude` |
| `indetectavel_por_magia_magias_adivinhacao_precisam_misticismo_cd30` | o portador de Rubis é mais difícil de observar por magia; conjurador deve passar em Misticismo CD 30 + quantidade de rubis para que adivinhação funcione | `os-rubis-da-virtude` |

## Magias — chave de LINK (fork 2)
- `aplica_condicao` (magias/*, ~20+): `capacidade` `lembrete`, `valor` = id da condição imposta ao ALVO
  (sono→`inconsciente`, amedrontar→`apavorado`, raio-do-enfraquecimento→`fatigado`…). É LINK magia→condição,
  não cálculo na ficha do conjurador. A MECÂNICA da condição (ex.: "−2 em testes") vive em `condicoes/<id>.json`
  como `efeitos[]` de verdade (arquitetura de 3 camadas — ver PROGRESSO, bloco magias). NÃO inventar número aqui.

### Lote magias fan-out (grupo 5 — 33 magias) — chaves novas fora do glossário
| chave | significado | de onde veio |
|-------|-------------|--------------|
| `nao_pode_lancar_magias` | enquanto ativa, a magia impede o conjurador de lançar outras magias | `potencia-divina` |
| `pode_refazer_teste_uma_vez_por_rodada` | 1×/rodada, pode rolar de novo um teste recém-feito e deve aceitar o novo resultado | `premonicao` |
| `atravessa_objetos_solidos` | forma incorpórea projetada atravessa objetos sólidos | `projetar-consciencia` |
| `remove_condicao_a_escolha` | remove 1 condição prejudicial dentre uma lista fixa (link — a mecânica de cada condição vive na entidade da condição) | `purificacao` |
| `ignora_dano_de_queda` | reduz a queda a ponto de não causar dano | `queda-suave` |
| `exige_teste_vontade_para_ser_atacado` | quem tenta agir hostilmente contra o alvo precisa passar em Vontade ou perde a ação | `santuario` |
| `remove_todas_condicoes_listadas` | remove TODAS as condições de uma lista fixa (variante "em massa" de `remove_condicao_a_escolha`) | `segunda-chance` |
| `exige_teste_vontade_para_gastar_pm` | toda ação que gaste PM do alvo exige um teste de Vontade ou falha (PM é gasto mesmo assim) | `selo-de-mana` |
| `sacrifica_servo_para_evitar_dano` | 1×/rodada, sacrifica um servo morto-vivo para anular um dano sofrido | `servo-morto-vivo` |
| `bonus_pericia_gastando_servo` | "gasta" um servo invisível para +2 não cumulativo em um teste de perícia (exceto ataque/resistência) | `servos-invisiveis` |

> Reusada sem alteração: `aplica_condicao` (fork 2, já documentada acima) — usada em `raio-do-enfraquecimento`
> (fatigado/vulneravel), `raio-polar` (paralisado/lento), `raio-solar` (ofuscado), `rogar-maldicao`
> (esmorecido/debilitado/lento/cego/surdo/caido — menu "escolha 1"), `roubar-a-alma` (abalado/caido/inconsciente).

> ⚠️ VOCABULÁRIO EM ABERTO (grupo 5):
> - `resistencia-a-energia`: RD 10 contra um tipo de dano ESCOLHIDO no momento do lançamento (não fixo).
>   Modelei como `bonus reducao_dano` com `condicao:{campo:"dano.tipo", igual:"@tipo_escolhido"}` — mas
>   `Magia` (efeitos.ts) não tem um mecanismo formal de `parametros`/`@escolha` como `PoderSelecionavel` tem
>   (`FOCO_EM_ARMA`). O `@tipo_escolhido` é um placeholder que só faz sentido se a interface `Magia` ganhar
>   um `parametros?` análogo. Sinalizando para o humano decidir se cria esse mecanismo ou se isso deveria ser
>   `capacidade lembrete` em vez de `bonus` condicionado a um parâmetro que não existe.
> - `EfeitoBonus`/`EfeitoSubstituicao` (em `efeitos.ts`) não declaram um campo `duracao` na interface TS, mas
>   o BRIEF (e o próprio exemplo `armadura-arcana` nele) pedem `"duracao":"cena"` dentro de cada efeito de magia.
>   Segui o brief (duracao em todo `bonus`/`substituicao` de magia) — mas fica um resíduo: o `efeitos.ts` lido
>   nesta sessão não tem esse campo tipado. Precisa reconciliar o `.ts` com o padrão já em uso.

### Lote magias fan-out (grupo 6 — 33 magias: silencio…voz-divina) — chaves novas
| chave | significado | de onde veio |
|-------|-------------|--------------|
| `impede_lancar_magias_na_area` | dentro da área, nenhuma magia pode ser conjurada (exige palavras mágicas) | `silencio` |
| `imune_calor_frio_extremos` | imune aos efeitos de calor e frio extremos do ambiente | `suporte-ambiental` |
| `respira_liquido_ou_ar_alternado` | pode respirar em água se normalmente respira ar (ou vice-versa) e não sufoca em fumaça densa | `suporte-ambiental` |
| `fica_indiferente_e_nao_ataca_se_falhar_resistencia` | se falhar no teste, a atitude do alvo muda para indiferente e ele não pode agir agressivamente; se passar, sofre -2 em ataques (modelado à parte como `bonus`) | `tranquilidade` |
| `proficiente_todas_armas` | enquanto ativa, concede proficiência com todas as armas | `transformacao-de-guerra` |
| `enxerga_atraves_camuflagem_ilusao_transmutacao` | enxerga através de camuflagem/escuridão e efeitos de ilusão/transmutação (formas translúcidas) | `visao-da-verdade` |
| `detecta_auras_magicas` | detecta e identifica automaticamente todas as auras mágicas em alcance médio | `visao-mistica` |
| `conversa_com_qualquer_criatura` | pode se comunicar com qualquer tipo de criatura (animal, construto, espírito, humanoide, monstro, morto-vivo), respeitando a Inteligência dela | `voz-divina` |

> Reusadas sem alteração (já existiam): `aplica_condicao` (silencio→surdo; sono→inconsciente/exausto/fatigado;
> sopro-das-uivantes→caido; sussurros-insanos→confuso; talho-invisivel-de-edauros→sangrando; teia→enredado;
> tentaculos-de-trevas→agarrado; terremoto→atordoado); `remove_condicao_a_escolha` (sopro-da-salvacao, idêntico
> ao uso em `purificacao` do grupo 5); `acao_extra_padrao_ou_movimento` (velocidade, idêntico ao padrão de
> `surto-heroico`); `nao_pode_lancar_magias` (transformacao-de-guerra, idêntico ao uso em `potencia-divina`).

> ⚠️ VOCABULÁRIO EM ABERTO (grupo 6):
> - `soco-de-arsenal`/`talho-invisivel-de-edauros` etc.: dano de magia com parcela "+ seu(a) atributo" (ex.:
>   "4d6 + sua Força") não é representável em `DanoMagia.fixo` (tipado como `number` fixo, não `Valor`/`expr`).
>   Modelei só a parte em dados (`{dados:{n:4,faces:6}}`), omitindo o `+For` — a prosa completa permanece intacta
>   em `descricao`. Se o motor um dia processar `mecanica.dano` de verdade, essa soma variável ficaria de fora.
>   Sinalizando para o humano decidir se `DanoMagia.fixo` deveria aceitar `Valor` (expr) também.
> - `terremoto`: dano (12d6 impacto / 200 fixo / 1d6 por rodada) varia por TIPO DE TERRENO (ramos mutuamente
>   exclusivos escolhidos pelo mestre, não simultâneos) — `mecanica.dano` (payload único ou array de tipos
>   simultâneos) não modela bem "escolha um dentre 5 cenários". Deixei `dano` de fora (só o `atordoado`
>   universal virou `aplica_condicao`); os números completos ficam só na prosa. Não é quarentena (nada foi
>   adivinhado), mas é um gap de modelagem se o motor precisar automatizar terreno-dependente no futuro.
> - `tranquilidade`: o efeito "-2 em ataques" só vale na ramificação de SUCESSO no teste de resistência
>   (a ramificação de falha vira indiferente e não ataca). Modelei o `bonus -2 ataque` como `automatica`
>   direto (sem condicionar à ramificação, já que no caso de falha o alvo nem ataca — o -2 fica inofensivo).
>   Sinalizando porque tecnicamente o -2 só é "correto" no ramo de sucesso.

## Lote magias fan-out (grupo 4 — intervencao-divina...pele-de-pedra, 33 magias) — chaves novas
| chave | significado | de onde veio |
|-------|-------------|---------------|
| `imune_efeitos_mentais` | imune às condições abalado/alquebrado/apavorado/atordoado/confuso/esmorecido/fascinado/frustrado/pasmo + efeitos de encantamento e ilusão (bundle escolhido pelo conjurador) | `invulnerabilidade` |
| `imune_efeitos_fisicos` | imune às condições atordoado/cego/debilitado/enjoado/envenenado/exausto/fatigado/fraco/lento/ofuscado/paralisado + acertos críticos, ataques furtivos e doenças (bundle escolhido pelo conjurador) | `invulnerabilidade` |
| `perde_capacidade_lancar_magias_arcanas` | o alvo perde a habilidade de lançar magias arcanas pela duração (cena ou 1 rodada, conforme o teste de resistência) | `lagrimas-de-wynna` |
| `domina_mente_alvos_obedece_comandos` | domina a mente de vários alvos ao mesmo tempo; obedecem cegamente exceto ordens suicidas | `legiao` |
| `camuflagem_total` | o alvo recebe camuflagem total enquanto invisível | `invisibilidade` |
| `torna_se_incorporeo` | o conjurador vira incorpóreo (só afetado por armas/habilidades mágicas ou outras criaturas incorpóreas; atravessa objetos sólidos) | `manto-de-sombras` |
| `sofre_dano_por_luz_direta` | vulnerável à luz direta: 1 ponto de dano por rodada se exposto a uma fonte de luz | `manto-de-sombras` |
| `teleporta_entre_sombras_por_pm` | gasta 1 PM + ação de movimento para se teletransportar entre sombras do próprio tamanho ou maior, em alcance médio | `manto-de-sombras` |
| `forca_alvo_a_obedecer_ordem` | grava uma ordem mística no alvo; ele gasta todas as ações do turno para cumpri-la, com chance de resistir a cada rodada | `marca-da-obediencia` |
| `controla_corpo_do_alvo` | controla fisicamente o corpo do alvo (ele mantém consciência, mas o corpo obedece ao conjurador) | `marionete` |
| `imune_dano_trevas` | imune a dano de trevas (Manto de Luz de `manto-do-cruzado`) | `manto-do-cruzado` |
| `assume_forma_selvagem_do_druida` | ao mudar para forma não humanoide, pode escolher uma Forma Selvagem do druida com os bônus correspondentes | `metamorfose` |
| `forca_cumprir_tarefa_ou_penalidade_cumulativa` | obriga o alvo a cumprir uma tarefa; se não se esforçar, sofre penalidade cumulativa de −2 em todos os testes e rolagens ao fim do dia | `missao-divina` |
| `bonus_penalidade_todos_testes_pericia` | ±2 em TODOS os testes de perícia de aliados/inimigos no alcance (sem ALVO genérico "todas as perícias" no namespace; só a parcela em `dano` foi modelada como `bonus`) | `oracao` |

> Nota de drift: `libertacao` reaproveitou a chave JÁ existente `imune_efeitos_movimento` (de `liberdade-divina`)
> em vez de propor uma nova — mesmo conceito ("imune a efeitos que impeçam/restrinjam deslocamento").

## Lote magias fan-out (grupo 3 — desintegrar...infligir-ferimentos, 33 magias) — chaves novas
| chave | significado | de onde veio |
|-------|-------------|---------------|
| `desintegra_criatura_reduzida_a_zero_pv` | se os PV do alvo chegam a 0 ou menos pelo dano desta magia, ele é completamente desintegrado (só resta pó) | `desintegrar` |
| `dano_dobrado_e_ignora_rd_contra_construto_ou_objeto` | dano dobrado e ignora RD quando o alvo é um construto ou objeto mundano | `despedacar` |
| `torna_se_parceiro_veterano_racional_que_fala` | o alvo vira parceiro veterano (tipo à escolha), criatura racional, e ganha fala | `despertar-consciencia` |
| `protegido_contra_deteccao_e_videncia_magica` | oculta a presença do alvo contra qualquer meio mágico de detecção/vidência (Vontade do detector anula) | `dificultar-deteccao` |
| `disco_absorve_pm_de_magias_dissipadas_para_uso_posterior` | o disco invocado faz contramágica automática e, se vencer, absorve os PM da magia dissipada como PM temporários utilizáveis pelo conjurador | `engenho-de-mana` |
| `torna_se_etereo_invisivel_incorporeo` | o conjurador vira etéreo: invisível (alternável), incorpóreo, move-se em qualquer direção, mas só afeta/é afetado por abjuração e essência | `forma-eterea` |
| `bloqueia_magias_de_ate_2_circulo_lancadas_contra_voce` | esfera que impede qualquer magia de até 2º círculo de ser lançada contra alvo dentro dela (área não é penetrada) | `globo-de-invulnerabilidade` |
| `imune_a_medo` | imunidade à condição de medo pela duração da magia | `heroismo` |
| `bonus_ataque_e_dano_contra_maior_nd_da_cena` | +4 (ou +6 aprimorado) em ataque e dano contra o inimigo de maior ND presente na cena — sem CAMPO para "maior ND na cena", fica lembrete | `heroismo` |
| `dano_dobrado_e_ignora_rd_contra_objeto_solto` | dano dobrado e ignora RD quando o alvo é um objeto solto (sem dono) | `flecha-acida` |
| `bonus_defesa_diminui_2_por_ataque_errado_ate_zerar` | cada ataque que erra o alvo destrói uma cópia ilusória e reduz o bônus de Defesa em 2 (decai até esgotar as cópias) | `imagem-espelhada` |
| `cura_em_vez_de_dano_se_alvo_for_morto_vivo` | se o alvo for morto-vivo, a magia cura em vez de causar dano (mesmos dados) | `infligir-ferimentos` |

> Nota de drift: `torna_se_etereo_invisivel_incorporeo` (forma-eterea) é PARECIDA com `torna_se_incorporeo`
> (manto-de-sombras, lote grupo 4), mas o efeito de forma-eterea inclui invisibilidade + movimento livre em
> qualquer direção além da incorporeidade — mantidas separadas por ora; considerar unificar na consolidação.

### Quarentenas do lote (ver `_REVISAO_PENDENTE.md`, seção "magias/ Grupo 3")
`explosao-caleidoscopica` (escada de condição por faixa de ND/nível — sem CAMPO), `fisico-divino` (escolha de
qual atributo recebe o bônus — sem mecanismo de escolha em `Magia`), `furia-do-panteao` (menu de 4 ataques por
turno, mesmo padrão de `relampago-flamejante-de-reynard`), `guardiao-divino` (pool de "pontos de luz" consumível,
convertendo em PV ou remoção de condição — sem tipo de payload pra pool).

## Magias — consolidação (correções do passe Opus)
- `bonus_2_todos_testes_pericia_aliados` (oracao): +2 em TODOS os testes de perícia de você/aliados (gap "todas as perícias").
- `penalidade_2_dano_e_todos_testes_pericia_inimigos_no_alcance` (oracao): −2 em dano e perícias dos INIMIGOS (outra ficha).
- `fica_indiferente_e_nao_ataca_se_falhar_resistencia` (tranquilidade): ramo de FALHA na resistência (o −2 do ramo de sucesso é lembrete, não automatica).

## Magias multi-modo `controlar-*` (upgrade p/ escolhas momento:"lancamento" — 22 chaves)
Chaves dentro de `ramo.efeitos[]` (um ramo por modo). Reaproveitada: `inverte_gravidade_area`.
| chave | magia |
|-------|-------|
| `aplica_condicao_adicional_se_falhar_atletismo` | controlar-a-gravidade |
| `congela_agua_mundana_da_area` · `derrete_gelo_mundano_e_encerra_a_magia` · `eleva_nivel_agua_ate_4_5m` · `evapora_agua_e_gelo_mundano_e_encerra_a_magia` · `reduz_nivel_agua_ate_4_5m` · `deixa_elementais_da_agua_lentos` | controlar-agua |
| `causa_dano_de_fogo_por_rodada_enquanto_sustentada` · `extingue_chama_e_cria_fumaca_com_camuflagem_leve` · `move_chama_9m_por_acao_livre_causando_dano_ao_atravessar_criatura` | controlar-fogo |
| `dobra_pv_do_item_de_madeira` · `remodela_a_forma_do_objeto_de_madeira` · `ataques_com_o_alvo_contra_voce_falham_automaticamente` · `objeto_de_madeira_se_abre_ou_desvia_de_voce` · `impoe_penalidade_5_em_pericia_ao_usar_o_item_retorcido` · `escudo_retorcido_perde_bonus_de_defesa_mas_mantem_penalidades` | controlar-madeira |
| `gera_bolha_de_tempo_lento_3_rodadas_so_para_voce` · `transporta_ate_6_criaturas_1_a_24_horas_ao_futuro` · `desfaz_a_ultima_rodada_uma_vez` | controlar-o-tempo |
| `cria_terreno_dificil_de_areia_ou_argila_se_atingir_o_piso` · `cria_objetos_ou_paredes_de_pedra_ou_argila` · `transforma_lama_ou_areia_em_terra_ou_pedra` | controlar-terra |

## Magias — lembrete-rico (decisão de categoria; ver PROGRESSO regra 23)
- `menu_ataques_alternativos_por_turno_*` (furia-do-panteao, relampago-flamejante-de-reynard)
- `pool_100_pontos_de_luz_gasta_a_vontade_1pv_por_ponto_ou_condicao_por_3` (guardiao-divino) — PRIMITIVA de recurso-consumível
- `efeito_escalona_por_nivel_ou_nd_do_alvo_3_faixas_x_passa_falha` (explosao-caleidoscopica)
- `espelha_dano_e_condicoes_a_um_terceiro_vinculado` (ligacao-sombria)
- `concede_vantagem_rolar_2d20_e_pegar_o_maior_em_um_teste` (orientacao) — FLAG DE PROMOÇÃO → `modo_rolagem` se recorrer

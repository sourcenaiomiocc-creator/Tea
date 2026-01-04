# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o projeto Matemática Kids! Toda ajuda é bem-vinda.

## 📋 Código de Conduta

Este projeto adere a um código de conduta. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## 🚀 Como Contribuir

### Reportar Bugs

Se encontrar um bug, por favor:

1. Verifique se já não existe uma issue sobre o problema
2. Abra uma nova issue incluindo:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs observado
   - Screenshots (se aplicável)
   - Ambiente (navegador, SO, etc.)

### Sugerir Melhorias

Para sugerir novas funcionalidades:

1. Abra uma issue com o label "enhancement"
2. Descreva claramente a funcionalidade
3. Explique por que ela seria útil
4. Se possível, sugira uma implementação

### Pull Requests

1. **Fork** o repositório
2. **Clone** seu fork localmente
3. Crie uma **branch** para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
4. **Faça as mudanças** seguindo o guia de estilo
5. **Teste** suas alterações completamente
6. **Commit** com mensagens claras:
   ```bash
   git commit -m "feat: adiciona validação de email"
   ```
7. **Push** para seu fork:
   ```bash
   git push origin feature/minha-feature
   ```
8. Abra um **Pull Request** descrevendo suas mudanças

## 💻 Guia de Estilo

### JavaScript

- Use `const` e `let`, evite `var`
- Nomes de variáveis em camelCase
- Nomes de funções descritivos
- Comentários em português para lógica complexa
- Sempre valide inputs do usuário

### HTML/CSS

- Use HTML semântico
- Classes em kebab-case
- Mantenha CSS organizado e comentado
- Mobile-first responsive design

### Segurança

- **NUNCA** commite credenciais ou API keys
- Sempre sanitize inputs do usuário
- Use HTTPS em produção
- Teste Security Rules do Firebase

## 🧪 Testes

Antes de submeter um PR:

- [ ] Teste em pelo menos 2 navegadores diferentes
- [ ] Verifique responsividade (mobile/tablet/desktop)
- [ ] Teste fluxos de autenticação
- [ ] Verifique console por erros
- [ ] Teste com diferentes perfis (aluno/professor)

## 📝 Convenções de Commit

Usamos commits semânticos:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Formatação, sem mudança de código
- `refactor:` - Refatoração de código
- `test:` - Adição de testes
- `chore:` - Manutenção, build, etc.

Exemplos:
```
feat: adiciona sistema de medalhas
fix: corrige cálculo de XP
docs: atualiza README com instruções Firebase
```

## 🔍 Processo de Revisão

Todos os PRs passam por revisão:

1. Verificação automática (se configurada)
2. Revisão de código por mantenedores
3. Testes manuais
4. Aprovação e merge

Seja paciente - revisões podem levar alguns dias!

## 🆘 Precisa de Ajuda?

- Abra uma issue com label "question"
- Descreva claramente sua dúvida
- Responderemos o mais rápido possível

## 📜 Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a mesma licença MIT do projeto.

---

Obrigado por ajudar a tornar este projeto melhor! ✨

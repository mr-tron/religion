# Проверенные партии

Каждый `batch_AAAA_BBBB.json` обрабатывает ровно 10–20 последовательных строк `religions.txt`. Формат и критерии описаны в `../AGENT_BATCH_PROMPT.md`. Эти файлы — исследовательские данные; сайт их пока не загружает.

Проверка после каждой партии:

```sh
node scripts/validate-batches.js
node scripts/build-catalog-report.js
node scripts/build-live-catalog.js
```

После проверки записи со статусом `keep` включаются в `catalog.js`. Записи со статусом `alias` остаются в исходном `religions.txt` и показываются в `REVIEW.md`, но не создают отдельный результат опроса. Статус `review` означает нерешённую неоднозначность, а не удаление записи.

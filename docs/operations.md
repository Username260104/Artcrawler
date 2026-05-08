# 운영 메모

## DB 원칙

배포 환경은 PostgreSQL을 기준으로 운영한다. `DATABASE_URL`이 없으면 새 수집을 실행하지 않는다.

초기 배포 순서:

```bash
npm run db:migrate
npm run db:seed
```

`db:migrate`는 `prisma/migrations`의 SQL을 배포 DB에 적용하고, `db:seed`는 활성 adapter의 전시를 수집해 DB에 upsert한다.

## 예약 크롤링

Vercel 배포 기준으로 하루 1회 `/api/cron/crawl`이 호출된다.

```json
{
  "path": "/api/cron/crawl",
  "schedule": "0 18 * * *"
}
```

Vercel cron은 UTC 기준이다. `0 18 * * *`는 한국 시간 기준 매일 새벽 3시다.

## 필요한 환경 변수

```text
DATABASE_URL
CRON_SECRET
```

`CRON_SECRET`이 설정되어 있으면 `/api/cron/crawl`은 다음 header를 요구한다.

```text
Authorization: Bearer <CRON_SECRET>
```

로컬 dry-run은 DB 없이 실행할 수 있다.

```bash
npm run crawl:dry
```

실제 DB upsert는 `DATABASE_URL`이 필요하다.

```bash
npm run crawl
```

## 현재 활성 adapter

- MMCA 서울
- 서울시립미술관
- 리움미술관
- 아트선재센터
- 국제갤러리
- 갤러리현대
- PKM 갤러리
- Pace Seoul
- White Cube Seoul
- Perrotin Seoul

Perrotin처럼 현재 서울 전시가 없으면 `partial`로 기록될 수 있다. 이는 네트워크 실패가 아니라 파싱 결과 0건을 뜻한다.

## 검증 명령

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run crawl:dry
```

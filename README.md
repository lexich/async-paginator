# paginator

## Smart pagination for big collections

Documentation: Work in progress....

Ordered paginator
```ts
import { paginator } from 'async-paginator';
const paginate = paginator([1,2,3,4], async (num) => num * 10);
for await (const result of paginate) {
    console.log('Task:', result);
}
// Output will be
/*
Task: 10
Task: 20
Task: 30
Task: 40
*/
```

Unordered paginator
```ts
import { paginatorUnordered } from 'async-paginator';
const paginate = paginatorUnordered([1,2,3,4], async () => {
    if (num % 2 === 0) {
        await sleep(10); // timeout 10ms
    }
    return num * 10;
});
for await (const result of paginate) {
    console.log('Task:', result);
}
// Output will be
/*
Task: { data: 10, index: 0 }
Task: { data: 30, index: 2 }
Task: { data: 20, index: 1 }
Task: { data: 40, index: 3 }
*/
```

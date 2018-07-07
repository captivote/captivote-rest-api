import { IArsenal } from '../../../api/arsenal/models.d';
import { user_mocks } from '../user/user_mocks';

export const arsenal_mocks: {successes: IArsenal[], failures: Array<{}>} = {
    failures: [
        {},
        { nom: false },
        { name: 'foo', bad_prop: true }
    ],
    successes:
        Array(5)
            .fill(null)
            .map((_, idx) => ({
                id: `chosen-${Math.floor(Math.random() * 1000)}`,
                owner: user_mocks.successes[idx].email
            })) as IArsenal[]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(arsenal_mocks);
}

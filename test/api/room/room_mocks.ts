import { IRoom } from '../../../api/room/models.d';
import { user_mocks } from '../user/user_mocks';

export const room_mocks: {successes: IRoom[], failures: Array<{}>} = {
    failures: [
        {},
        { nom: false },
        { name: 'foo', bad_prop: true }
    ],
    successes:
        Array(5)
            .fill(null)
            .map((_, idx) => ({
                name: `chosen-${Math.floor(Math.random() * 1000)}`,
                owner: user_mocks.successes[idx].email
            })) as IRoom[]
};

if (require.main === module) {
    /* tslint:disable:no-console */
    console.info(room_mocks);
}

import {connectDataBase} from "./connectDataBase";
import {OUR_DB} from "./constants";

export const connectionFactory = {
    provide: OUR_DB,
    useFactory: async  () => {
        return await connectDataBase.createConnection();
    },
};
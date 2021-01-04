import { expect } from "chai";
import SimpleLogger from "../src/index";
import * as path from "path";
import * as fs from "fs";

describe("UNIT: Test import and initialization", () => {
	it("Should create a logs file if it does not exists", async function () {
		return new Promise(async (resolve, reject) => {
			try {
				await SimpleLogger.debug("Test");
				const logDirPath = path.join(process.env.PWD as string, "logs");
				expect(fs.existsSync(logDirPath)).to.be.true;
				return resolve();
			} catch (error) {
				return reject(error);
			}
		});
	});
});

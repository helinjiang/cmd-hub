import { execSync } from "child_process";

export async function getNpmRunner(): Promise<string> {
  const getLatestVersion = (npmRunner: string) => {
    return new Promise((resolve) => {
      try {
        /**
         * 0.0.1
         npm notice
         npm notice New minor version of npm available! 7.10.0 -> 7.11.2
         npm notice Changelog: https://github.com/npm/cli/releases/tag/v7.11.2
         npm notice Run npm install -g npm@7.11.2 to update!
         npm notice
         */
        const latest = execSync(`${npmRunner} view cmd-hub version`, { timeout: 1500 }).toString().trim();

        resolve({
          from: npmRunner,
          latest
        });
      } catch (e) {
        if (process.env.SHOW_DEBUG_LOG) {
          // zsh: command not found: cnpm
          console.log(e);
        }
      }
    });
  };

  const getFromNpm = getLatestVersion('npm');

  const getFromTNpm = getLatestVersion('tnpm');

  const getFromCNpm = getLatestVersion('cnpm');

  const getFromTimeout = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        from: 'timeout',
        latest: 'unknown'
      });
    }, 2000);
  });

  try {
    const result = await Promise.race([
      getFromNpm,
      getFromTNpm,
      getFromCNpm,
      getFromTimeout
    ]) as ({ from: string, latest: string });

    if (['npm', 'tnpm', 'cnpm'].indexOf(result.from) > -1) {
      return result.from;
    } else {
      return 'npm';
    }

  } catch (e) {
    return 'npm';
  }
}

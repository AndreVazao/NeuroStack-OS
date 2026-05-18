const { isRunning, start, stop, status } = require('../processManager');
const cp = require('child_process');

jest.mock('child_process');

describe('processManager', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('status returns true if process is running', () => {
        cp.execSync.mockReturnValue(Buffer.from('1234'));
        expect(status('test-service')).toBe(true);
    });

    test('status returns false if process is not running', () => {
        cp.execSync.mockImplementation(() => { throw new Error('Not found'); });
        expect(status('test-service')).toBe(false);
    });
});

const Util = (function () {
    // 싱글톤 인스턴스
    let instance;

    // 인스턴스 생성 함수
    function createInstance() {
        return {
            ValidKorEng(value) {
                if (value === null || value === undefined || value === '') {
                    return false;
                }

                return /^[A-Za-z가-힣 ]+$/.test(String(value));
            },

            ValidEngUpper(value) {
                if (value === null || value === undefined || value === '') {
                    return false;
                }

                return /^[A-Z_]+$/.test(String(value));
            },

            ValidEngNumUpper(value) {
                if (value === null || value === undefined || value === '') {
                    return false;
                }

                return /^[A-Z0-9_]+$/.test(String(value));
            },

            /**
             * 사업자등록번호 포맷
             * 1234567890 → 123-45-67890
             */
            formatBusinessNumber(value) {
                if (value === null || value === undefined || value === '') {
                    return '';
                }

                const originalValue = String(value);
                const digits = originalValue
                    .replace(/\D/g, '')
                    .slice(0, 10);

                if (digits.length === 10) {
                    return [
                        digits.slice(0, 3),
                        digits.slice(3, 5),
                        digits.slice(5, 10),
                    ].join('-');
                }

                return originalValue;
            },

            /**
             * 전화번호 포맷
             *
             * 01012345678 → 010-1234-5678
             * 0311234567  → 031-123-4567
             * 0212345678  → 02-1234-5678
             * 021234567   → 02-123-4567
             */
            formatPhoneNumber(value) {
                if (value === null || value === undefined || value === '') {
                    return '';
                }

                const originalValue = String(value);
                const digits = originalValue.replace(/\D/g, '');

                // 서울 지역번호
                if (digits.startsWith('02')) {
                    if (digits.length === 10) {
                        return [
                            digits.slice(0, 2),
                            digits.slice(2, 6),
                            digits.slice(6, 10),
                        ].join('-');
                    }

                    if (digits.length === 9) {
                        return [
                            digits.slice(0, 2),
                            digits.slice(2, 5),
                            digits.slice(5, 9),
                        ].join('-');
                    }

                    return originalValue;
                }

                // 휴대전화 및 기타 지역번호
                if (digits.length === 11) {
                    return [
                        digits.slice(0, 3),
                        digits.slice(3, 7),
                        digits.slice(7, 11),
                    ].join('-');
                }

                if (digits.length === 10) {
                    return [
                        digits.slice(0, 3),
                        digits.slice(3, 6),
                        digits.slice(6, 10),
                    ].join('-');
                }

                return originalValue;
            },

            formatUnixDate(value) {
                if (value === null || value === undefined || value === '') {
                    return '-';
                }

                const numericValue = Number(value);

                if (Number.isNaN(numericValue)) {
                    return '-';
                }

                // 10자리 Unix seconds와 13자리 milliseconds 모두 지원
                const milliseconds =
                    numericValue < 1e12
                        ? numericValue * 1000
                        : numericValue;

                const date = new Date(milliseconds);

                if (Number.isNaN(date.getTime())) {
                    return '-';
                }

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');

                return `${year}-${month}-${day}`;
            },

            formatUnixDateTime(value) {
                if (value === null || value === undefined || value === '') {
                    return '-';
                }

                const numericValue = Number(value);

                if (Number.isNaN(numericValue)) {
                    return '-';
                }

                // 10자리 Unix seconds와 13자리 milliseconds 모두 지원
                const milliseconds =
                    numericValue < 1e12
                        ? numericValue * 1000
                        : numericValue;

                const date = new Date(milliseconds);

                if (Number.isNaN(date.getTime())) {
                    return '-';
                }

                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hour = String(date.getHours()).padStart(2, '0');
                const minute = String(date.getMinutes()).padStart(2, '0');

                return `${year}-${month}-${day} / ${hour}:${minute}`;
            },
        };
    }

    return {
        // 싱글톤 인스턴스를 반환
        getInstance() {
            if (!instance) {
                instance = createInstance();
            }

            return instance;
        },
    };
})();

export default Util;

// 사용 예시
//
// import Util from '@/common/Util.js';
//
// const util = Util.getInstance();
//
// util.formatBusinessNumber('1234567890');
// 결과: '123-45-67890'
//
// util.formatPhoneNumber('01012345678');
// 결과: '010-1234-5678'
//
// Util.getInstance().formatPhoneNumber('0212345678');
// 결과: '02-1234-5678'
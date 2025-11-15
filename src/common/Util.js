const Util = (function () {
    // 싱글톤 인스턴스
    let instance;

    // 인스턴스 생성 함수
    function createInstance() {
        return {
         

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
// Vue 컴포넌트에서 가져오기:
// const util = Util.getInstance();
// 유효성 검사 호출: util.isNumeric("123"), util.formatPhoneNumber("1234567890")

// 혹은 Util.getInstance().isNumeric("123") 로 바로 사용 가능
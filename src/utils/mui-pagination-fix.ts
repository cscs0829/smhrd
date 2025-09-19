/**
 * MUI TablePagination Select 데스크톱 클릭 문제 해결을 위한 유틸리티
 * 모바일과 동일한 동작을 데스크톱에서도 보장합니다.
 * 
 * 무한 루프 방지를 위해 간단하고 안전한 방식으로 구현
 */

// 이벤트 처리 중인지 확인하는 플래그
let isProcessingEvent = false

export const initializeMuiPaginationFix = () => {
  if (typeof window === 'undefined') return

  // 페이지네이션 Select 요소들의 스타일만 수정 (이벤트 리스너 제거)
  const fixPaginationSelects = () => {
    const selects = document.querySelectorAll('.MuiTablePagination-select')
    
    selects.forEach((select) => {
      const selectElement = select as HTMLElement
      
      // 이미 처리된 요소는 건너뛰기
      if (selectElement.dataset.paginationFixed) return
      selectElement.dataset.paginationFixed = 'true'
      
      // 스타일만 강제 적용 (이벤트 리스너는 추가하지 않음)
      selectElement.style.pointerEvents = 'auto'
      selectElement.style.cursor = 'pointer'
      selectElement.style.touchAction = 'manipulation'
      
      const selectInput = selectElement.querySelector('.MuiSelect-select') as HTMLElement
      if (selectInput) {
        selectInput.style.pointerEvents = 'auto'
        selectInput.style.cursor = 'pointer'
        selectInput.style.touchAction = 'manipulation'
        selectInput.style.userSelect = 'none'
      }
      
      const selectIcon = selectElement.querySelector('.MuiSelect-icon') as HTMLElement
      if (selectIcon) {
        selectIcon.style.pointerEvents = 'auto'
        selectIcon.style.cursor = 'pointer'
        selectIcon.style.touchAction = 'manipulation'
      }
    })
  }
  
  // 초기 실행
  fixPaginationSelects()
  
  // DOM 변경 감지하여 새로 생성된 요소들도 처리 (throttle 적용)
  let timeoutId: NodeJS.Timeout | null = null
  
  const observer = new MutationObserver(() => {
    // 기존 타이머가 있으면 취소
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    // 100ms 후에 실행 (throttle)
    timeoutId = setTimeout(() => {
      fixPaginationSelects()
      timeoutId = null
    }, 100)
  })
  
  // body 전체를 감시 (옵션 최소화)
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  // 정리 함수 반환
  return () => {
    observer.disconnect()
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

// 간단한 전역 스타일 적용 함수
export const applyGlobalMuiStyles = () => {
  if (typeof window === 'undefined') return

  // 이미 스타일이 적용되었는지 확인
  if (document.getElementById('mui-pagination-runtime-fix')) return

  const style = document.createElement('style')
  style.id = 'mui-pagination-runtime-fix'
  style.textContent = `
    /* 런타임 MUI 수정 - 무한 루프 방지 버전 */
    .MuiTablePagination-select.MuiInputBase-root,
    .MuiTablePagination-select .MuiSelect-select,
    .MuiTablePagination-select .MuiSelect-icon,
    .MuiMenuItem-root,
    .MuiIconButton-root {
      pointer-events: auto !important;
      cursor: pointer !important;
      touch-action: manipulation !important;
    }
    
    .MuiTablePagination-select .MuiSelect-select {
      user-select: none !important;
    }
    
    /* z-index 문제 해결 */
    .MuiMenu-root,
    .MuiPopover-root {
      z-index: 1300 !important;
    }
  `
  
  document.head.appendChild(style)
  
  return () => {
    const styleElement = document.getElementById('mui-pagination-runtime-fix')
    if (styleElement) {
      styleElement.remove()
    }
  }
}

// 모든 수정사항을 한 번에 적용 (안전한 버전)
export const applyMuiPaginationFixes = () => {
  const cleanup1 = initializeMuiPaginationFix()
  const cleanup2 = applyGlobalMuiStyles()
  
  return () => {
    cleanup1?.()
    cleanup2?.()
  }
}
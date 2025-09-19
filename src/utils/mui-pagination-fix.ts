/**
 * MUI TablePagination Select 데스크톱 클릭 문제 해결을 위한 유틸리티
 * 모바일과 동일한 동작을 데스크톱에서도 보장합니다.
 */

export const initializeMuiPaginationFix = () => {
  if (typeof window === 'undefined') return

  // 페이지네이션 Select 요소들을 찾아서 이벤트 리스너 추가
  const fixPaginationSelects = () => {
    const selects = document.querySelectorAll('.MuiTablePagination-select')
    
    selects.forEach((select) => {
      const selectElement = select as HTMLElement
      
      // 이미 처리된 요소는 건너뛰기
      if (selectElement.dataset.paginationFixed) return
      selectElement.dataset.paginationFixed = 'true'
      
      // 클릭 이벤트 강화
      const handleClick = (e: Event) => {
        e.stopPropagation()
        
        // Select 요소 찾기
        const selectInput = selectElement.querySelector('.MuiSelect-select') as HTMLElement
        
        if (selectInput) {
          // 포커스 설정
          selectInput.focus()
          
          // 클릭 이벤트 강제 발생
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
          selectInput.dispatchEvent(clickEvent)
        }
      }
      
      // 마우스다운 이벤트로 드롭다운 열기 보장
      const handleMouseDown = (e: Event) => {
        e.stopPropagation()
        
        // 약간의 지연 후 클릭 이벤트 발생
        setTimeout(() => {
          const selectInput = selectElement.querySelector('.MuiSelect-select') as HTMLElement
          if (selectInput) {
            const mouseDownEvent = new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
              view: window
            })
            selectInput.dispatchEvent(mouseDownEvent)
          }
        }, 0)
      }
      
      // 터치 이벤트 (모바일과 동일)
      const handleTouchStart = (e: Event) => {
        e.stopPropagation()
        
        const selectInput = selectElement.querySelector('.MuiSelect-select') as HTMLElement
        if (selectInput) {
          // 터치 이벤트는 간단하게 클릭 이벤트로 대체
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          })
          selectInput.dispatchEvent(clickEvent)
        }
      }
      
      // 이벤트 리스너 등록
      selectElement.addEventListener('click', handleClick, true)
      selectElement.addEventListener('mousedown', handleMouseDown, true)
      selectElement.addEventListener('touchstart', handleTouchStart, true)
      
      // 스타일 강제 적용
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
  
  // DOM 변경 감지하여 새로 생성된 요소들도 처리
  const observer = new MutationObserver((mutations) => {
    let shouldFix = false
    
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.querySelector?.('.MuiTablePagination-select') || 
                element.classList?.contains('MuiTablePagination-select')) {
              shouldFix = true
            }
          }
        })
      }
    })
    
    if (shouldFix) {
      // 약간의 지연 후 실행 (DOM 업데이트 완료 대기)
      setTimeout(fixPaginationSelects, 100)
    }
  })
  
  // body 전체를 감시
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
  
  // 정리 함수 반환
  return () => {
    observer.disconnect()
  }
}

// 메뉴 아이템 클릭 문제 해결
export const fixMenuItemClicks = () => {
  if (typeof window === 'undefined') return
  
  // 전역 클릭 이벤트 리스너
  const handleGlobalClick = (e: Event) => {
    const target = e.target as HTMLElement
    
    // MUI 메뉴 아이템 클릭 시 이벤트 전파 보장
    if (target.closest('.MuiMenuItem-root')) {
      e.stopPropagation()
      
      const menuItem = target.closest('.MuiMenuItem-root') as HTMLElement
      if (menuItem) {
        // 클릭 이벤트 강제 발생
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        })
        menuItem.dispatchEvent(clickEvent)
      }
    }
  }
  
  document.addEventListener('click', handleGlobalClick, true)
  
  return () => {
    document.removeEventListener('click', handleGlobalClick, true)
  }
}

// 모든 수정사항을 한 번에 적용
export const applyMuiPaginationFixes = () => {
  const cleanup1 = initializeMuiPaginationFix()
  const cleanup2 = fixMenuItemClicks()
  
  return () => {
    cleanup1?.()
    cleanup2?.()
  }
}